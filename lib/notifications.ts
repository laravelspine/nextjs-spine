"use client";

/**
 * Notifikasi core — store BERSAMA (useSyncExternalStore) untuk bell di topbar
 * dan halaman /notifications. Sumber kebenaran = tabel notifikasi backend
 * (semua modul menulis via BaseNotification::toDatabase).
 *
 * Sumber pembaruan:
 * 1. `refresh()` — GET /api/v1/notifications (list + meta.unread_count).
 * 2. Polling 30 dtk sebagai JARING PENGAMAN, subscriber-gated (jalan hanya
 *    saat ada konsumen terpasang: button topbar / halaman).
 * 3. `onIncoming(payload)` — dipanggil lib/realtime.ts saat event
 *    `notification.sent` tiba via Reverb. Optimistic (naikkan badge dulu),
 *    lalu refresh() untuk mendamaikan dengan server.
 */

import { useEffect, useSyncExternalStore } from "react";
import { api, getToken } from "./api";

export interface SpineNotification {
  id: string;
  type: string;
  data: {
    title?: string;
    body?: string;
    module?: string;
    url?: string | null;
  };
  read_at: string | null;
  created_at: string;
}

type RawNotification = Omit<SpineNotification, "data"> & { data: unknown };

/** Toleransi bentuk `data`: objek (lewat BaseNotification) atau string JSON
 *  (baris mentah dari luar — terpaksa migrate/migrasi data). */
export function normalize(n: RawNotification): SpineNotification {
  let data: SpineNotification["data"] = {};
  if (typeof n.data === "string") {
    try {
      data = JSON.parse(n.data) ?? {};
    } catch {
      data = {};
    }
  } else if (n.data && typeof n.data === "object") {
    data = n.data as SpineNotification["data"];
  }
  return { ...n, data };
}

export interface NotificationPayload {
  title?: string;
  message?: string;
  type?: string;
  data?: Record<string, unknown>;
}

interface NotifState {
  items: SpineNotification[];
  unreadCount: number;
  loading: boolean;
}

const INITIAL: NotifState = { items: [], unreadCount: 0, loading: true };

const POLL_INTERVAL_MS = 30_000;
const PER_PAGE = 20;

let state: NotifState = INITIAL;
let inflight: Promise<void> | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) startPolling();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stopPolling();
  };
}

function startPolling() {
  stopPolling();
  timer = setInterval(() => {
    refreshNotifications();
  }, POLL_INTERVAL_MS);
}

function stopPolling() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function getSnapshot(): NotifState {
  return state;
}

function getServerSnapshot(): NotifState {
  return INITIAL;
}

/** Ambil ulang list + unread_count dari backend. Idempotent (dedup via inflight). */
export async function refreshNotifications(): Promise<void> {
  const token = getToken();
  if (!token) {
    if (state !== INITIAL || state.loading) {
      state = { ...INITIAL, loading: false };
      notify();
    }
    return;
  }
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await api<{
        data?: RawNotification[];
        meta?: { unread_count?: number };
      }>(`/api/v1/notifications?per_page=${PER_PAGE}`);
      if (res.ok) {
        state = {
          items: (res.data?.data ?? []).map(normalize),
          unreadCount: res.data?.meta?.unread_count ?? 0,
          loading: false,
        };
      } else {
        state = { ...state, loading: false };
      }
    } catch {
      state = { ...state, loading: false };
    } finally {
      inflight = null;
      notify();
    }
  })();
  return inflight;
}

/** Push realtime dari Reverb (event `notification.sent`). Optimistic dulu,
 *  lalu refresh() untuk mendamaikan id/read_at dengan server. */
export function onIncomingNotification(payload: NotificationPayload): void {
  const token = getToken();
  if (!token) return;
  const item: SpineNotification = {
    id: "__pending__",
    type: "realtime",
    data: {
      title: payload.title,
      body: payload.message,
      url: typeof payload.data?.url === "string" ? payload.data.url : null,
    },
    read_at: null,
    created_at: new Date().toISOString(),
  };
  const already = state.items.some(
    (n) =>
      n.data.title === item.data.title &&
      n.data.body === item.data.body &&
      n.id !== "__pending__"
  );
  if (already) return;
  state = { ...state, items: [item, ...state.items], unreadCount: state.unreadCount + 1 };
  notify();
  refreshNotifications();
}

export async function markNotificationRead(id: string): Promise<void> {
  if (id === "__pending__") return;
  const wasUnread = !state.items.find((n) => n.id === id)?.read_at;
  state = {
    ...state,
    items: state.items.map((n) =>
      n.id === id ? { ...n, read_at: new Date().toISOString() } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - (wasUnread ? 1 : 0)),
  };
  notify();
  const res = await api(`/api/v1/notifications/${id}/read`, { method: "POST" });
  if (!res.ok) refreshNotifications();
}

export async function markAllNotificationsRead(): Promise<void> {
  state = {
    ...state,
    items: state.items.map((n) => ({
      ...n,
      read_at: n.read_at ?? new Date().toISOString(),
    })),
    unreadCount: 0,
  };
  notify();
  const res = await api("/api/v1/notifications/read-all", { method: "POST" });
  if (!res.ok) refreshNotifications();
}

export function useNotifications() {
  const token = getToken();
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    // deps token: refetch saat login; reset saat logout (polling ikut mati).
    refreshNotifications();
  }, [token]);

  return {
    ...snapshot,
    refresh: refreshNotifications,
    markRead: markNotificationRead,
    markAllRead: markAllNotificationsRead,
  };
}
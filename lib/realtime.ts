"use client";

/**
 * Realtime — laravel-echo + Reverb. Lapisan TRANSPORT tipis: hanya langganan
 * private channel `user.{id}` ke event `notification.sent`, lalu menyerahkan
 * ke create store di lib/notifications.ts (`onIncomingNotification`).
 *
 * UI/state tidak tahu dari mana data datang (push atau polling) — keduanya
 * menuju fungsi refresh yang sama di store. Saat token/logout berubah,
 * pemanggil (NotificationButton) memanggil realtimeStop()/realtimeStart().
 */

import type Echo from "laravel-echo";
import { API_URL, api, getToken } from "./api";
import { onIncomingNotification } from "./notifications";
import type { NotificationPayload } from "./notifications";

type EchoChannel = {
  listen: (event: string, cb: (data: unknown) => void) => void;
  stopListening: (event: string) => void;
};

type EchoHandle = {
  private: (channelName: string) => EchoChannel;
  disconnect: () => void;
};

let echo: EchoHandle | null = null;
let channel: EchoChannel | null = null;
let activeUserId: number | null = null;
let connecting = false;

export async function realtimeStart(userId: number): Promise<void> {
  const token = getToken();
  if (!token) return;
  if (activeUserId === userId && echo && channel) return; // sudah terhubung
  realtimeStop();
  if (connecting) return;
  connecting = true;
  try {
    const [{ default: EchoClass }, { default: Pusher }] = await Promise.all([
      import("laravel-echo"),
      import("pusher-js"),
    ]);

    const res = await api<{
      driver?: string;
      key?: string;
      scheme?: string;
      host?: string;
      port?: number;
    }>("/api/v1/broadcast/config");
    if (!res.ok || !res.data?.host) {
      console.warn("[realtime] Tidak dapat config broadcast:", res.error);
      return;
    }

    // Catatan: laravel-echo memakai `options.client` langsung sebagai pusher
    // instance (bukan kelas). Lewati `client` dan biarkan Echo membuat instance
    // sendiri lewat `options.Pusher` (nama besar, kontras dengan `client`).
    echo = new EchoClass({
      broadcaster: "reverb",
      Pusher: Pusher,
      key: res.data.key,
      wsHost: res.data.host,
      wsPort: res.data.port ?? 8080,
      scheme: res.data.scheme ?? "http",
      forceTLS: (res.data.scheme ?? "http") === "https",
      authEndpoint: `${API_URL}/api/v1/broadcasting/auth`,
      auth: { headers: { Authorization: `Bearer ${token}` } },
      enabledTransports: ["ws", "wss"],
    });

    const ch = echo.private(`user.${userId}`);
    ch.listen(".notification.sent", (e: unknown) => {
      onIncomingNotification(e as NotificationPayload);
    });
    channel = ch;
    activeUserId = userId;
  } catch (err) {
    console.warn("[realtime] Gagal connect Echo:", err);
  } finally {
    connecting = false;
  }
}

export function realtimeStop(): void {
  try {
    channel?.stopListening(".notification.sent");
  } catch {
    // abaikan — koneksi mungkin sudah ditutup
  }
  try {
    echo?.disconnect();
  } catch {
    // abaikan
  }
  echo = null;
  channel = null;
  activeUserId = null;
}
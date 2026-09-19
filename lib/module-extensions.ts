"use client";

import { useEffect, useSyncExternalStore } from "react";
import { api, getToken } from "./api";
import type { DetailTab } from "./master-detail";
import type { ModuleManifestEntry } from "./modules/types";

export interface ModuleMenuItem {
  slug: string;
  label: string;
  icon?: string;
  href: string;
  position?: number;
  module: string;
}

export interface ModuleWidget {
  id: string;
  area: string;
  title: string;
  api: string;
  module: string;
}

export interface ModuleExtensions {
  menu: ModuleMenuItem[];
  widgets: ModuleWidget[];
  detail_tabs: Record<string, DetailTab[]>;
  /** Modul aktif dari backend — dipakai runtime loader untuk boot bundle. */
  modules: ModuleManifestEntry[];
}

/**
 * Registry frontend — menu + widget + detail_tabs + modul aktif dari backend.
 * Padanan get_sidebar_menu_items() + render_dashboard_widgets() legacy:
 * satu request ke /api/v1/modules/extensions, core merender apa adanya.
 *
 * STORE BERSAMA (useSyncExternalStore): semua konsumen (Sidebar, ModuleWidgets,
 * module-host, halaman sample) berbagi SATU snapshot. Saat status modul diubah
 * di halaman modules (enable/disable/uninstall), panggil `refresh()` agar menu/
 * widget/detail_tabs/modules langsung ter-update TANPA reload. `refresh`
 * idempotent: request in-flight dipakai bersama, tidak duplikat.
 */

const EMPTY: ModuleExtensions = { menu: [], widgets: [], detail_tabs: {}, modules: [] };

interface ExtState {
  ext: ModuleExtensions;
  loading: boolean;
}

let state: ExtState = { ext: EMPTY, loading: true };
let inflight: Promise<ModuleExtensions | null> | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ExtState {
  return state;
}

function getServerSnapshot(): ExtState {
  return { ext: EMPTY, loading: true };
}

/** Ambil ulang registry modul dari backend. Dipanggil saat login/logout
 *  (deps token) dan oleh halaman modules setelah enable/disable/uninstall. */
export async function refreshModuleExtensions(): Promise<ModuleExtensions | null> {
  const token = getToken();
  if (!token) {
    if (state.ext !== EMPTY || state.loading) {
      state = { ext: EMPTY, loading: false };
      notify();
    }
    return null;
  }
  if (inflight) return inflight;
  state = { ...state, loading: true };
  notify();
  inflight = (async () => {
    try {
      const res = await api<ModuleExtensions>("/api/v1/modules/extensions");
      if (res.ok) {
        const next: ModuleExtensions = {
          menu: res.data?.menu ?? [],
          widgets: res.data?.widgets ?? [],
          detail_tabs: res.data?.detail_tabs ?? {},
          modules: res.data?.modules ?? [],
        };
        state = { ext: next, loading: false };
        return next;
      }
      state = { ext: state.ext, loading: false };
      return null;
    } catch {
      state = { ext: state.ext, loading: false };
      return null;
    } finally {
      inflight = null;
      notify();
    }
  })();
  return inflight;
}

export function useModuleExtensions() {
  const token = getToken();
  const { ext, loading } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    // deps token: re-fetch saat login/logout — kalau mount saat belum login
    // (menu kosong), fetch ulang begitu token tersedia. Dedup via `inflight`.
    refreshModuleExtensions();
  }, [token]);

  return { ...ext, loading, refresh: refreshModuleExtensions };
}

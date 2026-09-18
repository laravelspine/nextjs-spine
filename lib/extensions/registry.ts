import type {
  NavigationExtension,
  SectionExtension,
  TabExtension,
  UIExtension,
  UIExtensionArea,
} from "./types";

/**
 * UI Extension Registry — store tunggal untuk SEMUA ekstensi UI dari
 * modul. Modul memanggil `register()`; core memanggil `getExtensions(area)`
 * dan merender apa adanya. Core TIDAK menyimpan daftar ekstensi hardcoded.
 */
const registrations: UIExtension[] = [];

type Listener = () => void;
const listeners = new Set<Listener>();

export function register<T extends UIExtension>(ext: T) {
  const exists = registrations.some((e) => e.area === ext.area && e.id === ext.id);
  if (exists) return; // idempotent — aman saat HMR modul boot ulang
  registrations.push(ext);
  listeners.forEach((l) => l());
}

export function getExtensions(area: "profile.tabs" | "settings.tabs"): TabExtension[];
export function getExtensions(area: "navigation.main" | "navigation.profile"): NavigationExtension[];
export function getExtensions(
  area: "profile.sections" | "settings.sections" | "dashboard.widgets"
): SectionExtension[];
export function getExtensions(area: UIExtensionArea): UIExtension[];
export function getExtensions(area: UIExtensionArea): UIExtension[] {
  return registrations
    .filter((e) => e.area === area)
    .sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
}

/** Notifikasi ke konsumer (hook) saat ada registrasi baru. */
export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
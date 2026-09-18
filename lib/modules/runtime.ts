import { API_URL } from "@/lib/api";
import { loadModules } from "./loader";
import type { ModuleManifestEntry, SpineModule } from "./types";

/**
 * Runtime module loader — memuat bundle frontend modul dari URL.
 *
 * Discovery BACKEND-DRIVEN (pola WordPress/PerfexCRM): core tidak punya
 * daftar modul hardcoded. Admin Laravel menentukan modul aktif lewat
 * /api/v1/modules/extensions → tiap modul aktif membawa `entry_url`.
 * Core cukup melakukan `import(url)` runtime lalu mengeksekusi
 * `register(context)`-nya.
 */

const loaded = new Map<string, boolean>();
const pending = new Map<string, Promise<unknown>>();
const errors = new Map<string, string>();

/** Error loader terbaru per modul (idempotent; tidak menggagalkan modul lain). */
export function getModuleErrors(): ReadonlyMap<string, string> {
  return errors;
}

/** True setelah modul sukses diregistrasi. */
export function isModuleLoaded(id: string): boolean {
  return loaded.get(id) ?? false;
}

/**
 * Muat satu bundle modul lewat dynamic import. URL boleh lintas-origin
 * (di-host backend Laravel atau CDN modul) — `webpackIgnore` memastikan
 * Next.js tidak mencoba meng-bundle/modulize URL tersebut saat build.
 */
async function loadFromUrl(url: string): Promise<void> {
  // URL relatif (mis. "/modules/sampletasks/...") di-resolve terhadap base API
  // backend (Spine) — sama origin dengan manifest, tanpa hardcode host.
  const target = /^https?:\/\//.test(url) ? url : `${API_URL}${url}`;
  const mod = (await import(/* webpackIgnore: true */ target)) as {
    default?: SpineModule;
  };
  const spineModule = mod.default;
  if (!spineModule?.id || typeof spineModule.register !== "function") {
    throw new Error(`Bundle '${target}' tidak mengekspor default SpineModule`);
  }
  loadModules([spineModule]);
  loaded.set(spineModule.id, true);
}

/**
 * Boot dari daftar manifest aktif. Dipanggil oleh hook `useModuleManifest`.
 * Idempotent: modul yang sudah dimuat di-lewati; error per-modul dicatat.
 */
export async function bootModulesFromManifest(entries: ModuleManifestEntry[]) {
  const active = entries.filter((e) => e.enabled && e.entry_url);
  for (const entry of active) {
    const id = entry.alias || entry.name;
    if (loaded.has(id) || pending.has(id)) continue;
    const task = loadFromUrl(entry.entry_url!)
      .catch((err: unknown) => {
        errors.set(
          id,
          err instanceof Error ? err.message : String(err)
        );
      })
      .finally(() => pending.delete(id));
    pending.set(id, task);
  }
  await Promise.all([...pending.values()]);
}

/** Reset state (berguna untuk uji/test). */
export function resetModuleRuntime() {
  loaded.clear();
  pending.clear();
  errors.clear();
}
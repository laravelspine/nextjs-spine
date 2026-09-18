import { loadModules } from "./loader";
import { modules } from "./catalog";

export type { ModuleContext, ModuleUiApi, SpineModule } from "./types";
export { createModuleContext, loadModules } from "./loader";
export { modules } from "./catalog";

/**
 * Boot module — panggil sekali (via lib/extensions) sebelum render.
 * Isi daftar module ada di `./catalog` (kosong sekarang; demo Referrals
 * sedang dibahas dan belum di-commit).
 */
export function bootModules() {
  loadModules(modules);
}
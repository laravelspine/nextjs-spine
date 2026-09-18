"use client";

import { bootModules } from "@/lib/modules";

/**
 * Public API UI Extension System + bootstrap.
 * Impor `@/lib/extensions` DARI MANA PUN → modul ikut di-boot sekali
 * (idempotent karena registry menduplikasi per (area, id)). Konsumen core
 * (Sidebar, Profile, Settings, Dashboard) hanya memakai export di bawah ini.
 */
bootModules();

export type {
  NavigationExtension,
  SectionExtension,
  TabExtension,
  UIExtension,
  UIExtensionArea,
  UIComponent,
} from "./types";
export { ExtensionSlot, canRender } from "./renderer";
export { useExtensions } from "./hooks";
export { getExtensions } from "./registry";
export { t, addTranslations } from "./i18n";
export { hasPermission, setGrantedPermissions } from "./permissions";
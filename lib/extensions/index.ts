"use client";

/**
 * Public API UI Extension System.
 * Impor `@/lib/extensions` DARI MANA PUN → hanya menyediakan API registry.
 * Pemuatan module TIDAK lagi side-effect statis: bundle modul di-boot
 * runtime lewat `useModuleManifest` (untuk dipercaya backend/admin Laravel).
 */

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
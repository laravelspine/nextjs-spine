import type { ComponentType, LazyExoticComponent } from "react";

/** Label yang bisa di-i18n: string langsung, atau referensi kamus namespace.key. */
export type Label = string | { namespace: string; key: string };

/** Komponen UI — boleh lazy (dynamic import) supaya chunk per-modul terpisah. */
export type UIComponent =
  | ComponentType
  | LazyExoticComponent<ComponentType>;

/**
 * Area ekstensi UI. Panjang area ini = kontrak: core hanya tahu area,
 * modul mendaftarkan isinya. Tambah area = tambah kontrak renderer baru.
 */
export type UIExtensionArea =
  | "navigation.main"
  | "navigation.profile"
  | "profile.tabs"
  | "profile.sections"
  | "settings.tabs"
  | "settings.sections"
  | "dashboard.widgets";

/** Atribut bersama semua ekstensi. */
export interface UIExtensionBase {
  id: string;
  label: Label;
  icon?: string;
  /** Urutan tampil; kecil = dulu. Default 999. */
  position?: number;
  /**
   * Permission untuk show/hide UI saja (bukan security boundary —
   * backend Laravel tetap otoritas penuh). Kosong = selalu tampil.
   */
  permission?: string;
  /** Nama modul pemilik ekstensi. */
  module: string;
}

/** Item navigasi — tautan di sidebar/nav area. */
export interface NavigationExtension extends UIExtensionBase {
  area: "navigation.main" | "navigation.profile";
  href: string;
}

/**
 * Tab — contohnya {"area":"profile.tabs","route":"/profile/my-referral"}.
 * `component` dirender inline di panel tab; `route` metadata untuk
 * navigasi langsung (file-system route kalau modul punya halaman sendiri).
 */
export interface TabExtension extends UIExtensionBase {
  area: "profile.tabs" | "settings.tabs";
  component: UIComponent;
  route?: string;
}

/** Section — blok konten yang disisipkan ke halaman/panel. */
export interface SectionExtension extends UIExtensionBase {
  area: "profile.sections" | "settings.sections" | "dashboard.widgets";
  component: UIComponent;
}

export type UIExtension =
  | NavigationExtension
  | TabExtension
  | SectionExtension;
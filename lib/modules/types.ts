import type {
  NavigationExtension,
  SectionExtension,
  TabExtension,
} from "@/lib/extensions/types";

/**
 * Kontrak module Spine. Core hanya tahu interface ini — module membawa
 * data + komponennya sendiri dan mendaftarkan UI via `register(context)`,
 * tanpa memodifikasi kode Core.
 */
export interface SpineModule {
  id: string;
  name: string;
  version: string;
  register(context: ModuleContext): void;
}

/** API UI yang modul boleh pakai untuk mendaftarkan ekstensinya. */
export interface ModuleUiApi {
  navigation: {
    register(ext: NavigationExtension): void;
  };
  tabs: {
    register(ext: TabExtension): void;
  };
  sections: {
    register(ext: SectionExtension): void;
  };
}

export interface ModuleContext {
  module: Pick<SpineModule, "id" | "name" | "version">;
  ui: ModuleUiApi;
  /** Terjemahan milik module sendiri (`{module.id}.{key}`). */
  t: (key: string) => string;
}
import { register } from "@/lib/extensions/registry";
import { addTranslations, t } from "@/lib/extensions/i18n";
import { locales } from "@/lib/i18n";
import type {
  NavigationExtension,
  SectionExtension,
  TabExtension,
} from "@/lib/extensions/types";
import type { ModuleContext, ModuleUiApi, SpineModule } from "./types";

/** Context per-module — membungkus registry core menjadi API yang ramah modul. */
export function createModuleContext(module: SpineModule): ModuleContext {
  const ui: ModuleUiApi = {
    navigation: {
      register: (ext: NavigationExtension) => register(ext),
    },
    tabs: {
      register: (ext: TabExtension) => register(ext),
    },
    sections: {
      register: (ext: SectionExtension) => register(ext),
    },
  };

  return {
    module: { id: module.id, name: module.name, version: module.version },
    ui,
    t: (key: string) => t({ namespace: module.id, key }),
    i18n: { addTranslations },
  };
}

/** Muat (register) satu kumpulan module. Panggil saat bundle tiba. */
export function loadModules(modules: SpineModule[]) {
  for (const m of modules) {
    // Daftarkan terjemahan per-locale (jika modul menyediakan).
    if (m.translations) {
      for (const [locale, messages] of Object.entries(m.translations)) {
        addTranslations("module." + m.id, messages as Record<string, string>, locale as typeof locales[number]);
      }
    }
    m.register(createModuleContext(m));
  }
}
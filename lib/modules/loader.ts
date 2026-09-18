import { register } from "@/lib/extensions/registry";
import { t } from "@/lib/extensions/i18n";
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
  };
}

/** Muat (register) satu kumpulan module. Panggil sekali saat boot. */
export function loadModules(modules: SpineModule[]) {
  for (const m of modules) {
    m.register(createModuleContext(m));
  }
}
"use client";

import { useEffect, useState } from "react";
import { api } from "./api";
import type { DetailTab } from "./master-detail";

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
}

/**
 * Registry frontend — menu + widget + detail_tabs dari SEMUA modul aktif.
 * Padanan get_sidebar_menu_items() + render_dashboard_widgets() legacy:
 * satu request ke /api/v1/modules/extensions, core merender apa adanya.
 */
export function useModuleExtensions() {
  const [ext, setExt] = useState<ModuleExtensions>({
    menu: [],
    widgets: [],
    detail_tabs: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<ModuleExtensions>("/api/v1/modules/extensions")
      .then((res) => {
        if (res.ok) {
          setExt({
            menu: res.data?.menu ?? [],
            widgets: res.data?.widgets ?? [],
            detail_tabs: res.data?.detail_tabs ?? {},
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { ...ext, loading };
}

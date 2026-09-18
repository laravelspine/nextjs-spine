"use client";

import { useEffect, useState } from "react";
import { api, getToken } from "./api";
import type { DetailTab } from "./master-detail";
import type { ModuleManifestEntry } from "./modules/types";

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
  /** Modul aktif dari backend — dipakai runtime loader untuk boot bundle. */
  modules: ModuleManifestEntry[];
}

/**
 * Registry frontend — menu + widget + detail_tabs + modul aktif dari backend.
 * Padanan get_sidebar_menu_items() + render_dashboard_widgets() legacy:
 * satu request ke /api/v1/modules/extensions, core merender apa adanya.
 */
export function useModuleExtensions() {
  const [ext, setExt] = useState<ModuleExtensions>({
    menu: [],
    widgets: [],
    detail_tabs: {},
    modules: [],
  });
  const [loading, setLoading] = useState(true);
  const token = getToken();

  useEffect(() => {
    // deps token: re-fetch saat login/logout — kalau mount saat belum login
    // (menu kosong), fetch ulang begitu token tersedia.
    if (!token) {
      setExt({ menu: [], widgets: [], detail_tabs: {}, modules: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    api<ModuleExtensions>("/api/v1/modules/extensions")
      .then((res) => {
        if (res.ok) {
          setExt({
            menu: res.data?.menu ?? [],
            widgets: res.data?.widgets ?? [],
            detail_tabs: res.data?.detail_tabs ?? {},
            modules: res.data?.modules ?? [],
          });
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  return { ...ext, loading };
}

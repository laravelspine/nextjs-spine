"use client";

import { useEffect, useState } from "react";
import { getExtensions, subscribe } from "./registry";
import { hasPermission } from "./permissions";
import type {
  NavigationExtension,
  SectionExtension,
  TabExtension,
  UIExtension,
  UIExtensionArea,
} from "./types";

type ExtOfArea<A extends UIExtensionArea> =
  A extends "profile.tabs" | "settings.tabs"
    ? TabExtension
    : A extends "navigation.main" | "navigation.profile"
      ? NavigationExtension
      : A extends "profile.sections" | "settings.sections" | "dashboard.widgets"
        ? SectionExtension
        : never;

function read(area: UIExtensionArea): UIExtension[] {
  return getExtensions(area).filter((e) => hasPermission(e.permission));
}

/**
 * useExtensions(area) — daftar ekstensi tampil untuk sebuah area:
 * difilter permission + diurutkan position. Langganan registri → re-render
 * otomatis kalau modul mendaftar lebih lambat (HMR / boot async).
 */
export function useExtensions<A extends UIExtensionArea>(area: A): ExtOfArea<A>[] {
  const [list, setList] = useState<ExtOfArea<A>[]>(() => read(area) as ExtOfArea<A>[]);

  useEffect(() => {
    const apply = () => setList(read(area) as ExtOfArea<A>[]);
    apply();
    return subscribe(apply);
  }, [area]);

  return list;
}
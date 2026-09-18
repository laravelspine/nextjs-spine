"use client";

import { useEffect, useState } from "react";
import { useModuleExtensions } from "@/lib/module-extensions";
import { bootModulesFromManifest, getModuleErrors, isModuleLoaded } from "./runtime";

/**
 * Module manifest hook — menghubungkan manifest backend (deps `token`)
 * ke runtime loader. Admin Laravel mengubah daftar aktif → manifest baru →
 * bundle modul ikut dimuat/berhenti tanpa build ulang core.
 */
export function useModuleManifest() {
  const { loading, modules } = useModuleExtensions();
  const [booting, setBooting] = useState(false);

  useEffect(() => {
    if (loading || modules.length === 0) return;
    let cancelled = false;
    setBooting(true);
    bootModulesFromManifest(modules).finally(() => {
      if (!cancelled) setBooting(false);
    });
    return () => {
      cancelled = true;
    };
  }, [loading, modules]);

  return {
    loading: loading || booting,
    modules,
    loaded: (id: string) => isModuleLoaded(id),
    errors: getModuleErrors(),
  };
}
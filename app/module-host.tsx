"use client";

import * as React from "react";
import { API_URL } from "@/lib/api";
import { useModuleManifest } from "@/lib/modules";

/**
 * ModuleHost — jembatan (host bridge) antara core dan bundle modul eksternal.
 *
 * 1. Mengekspos React host + base URL API lewat `globalThis.__SPINE__`
 *    supaya bundle modul (yang di-load via `import(url)` runtime, tanpa
 *    bundler host) memakai SATU instance React yang sama dan tahu ke mana
 *    memanggil API — komponen modul render & fetch normal.
 * 2. Memicu `useModuleManifest()` — fetch manifest /api/v1/modules/extensions
 *    (deps token) dan boot bundle modul aktif lewat runtime loader.
 */

declare global {
  interface Window {
    /** Kontrak host untuk bundle modul eksternal. */
    __SPINE__?: {
      react: typeof React;
      /** Base URL API host (NEXT_PUBLIC_API_URL). */
      apiBase: string;
    };
  }
}

export function ensureSpineBridge() {
  if (typeof window !== "undefined" && !window.__SPINE__) {
    window.__SPINE__ = { react: React, apiBase: API_URL };
  }
}

export default function ModuleHost() {
  ensureSpineBridge();
  useModuleManifest();
  return null;
}
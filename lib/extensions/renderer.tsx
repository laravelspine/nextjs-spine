"use client";

import { Suspense } from "react";
import { hasPermission } from "./permissions";
import type { UIComponent } from "./types";

/**
 * ExtensionSlot — render komponen ekstensi dengan fallback lazy-load.
 * `lazy()` (dynamic import) wajib dibungkus Suspense; komponen statis
 * juga aman di dalamnya (fallback tidak pernah tampil).
 */
export function ExtensionSlot({
  component,
  fallback,
  props,
}: {
  component: UIComponent;
  fallback?: React.ReactNode;
  props?: Record<string, unknown>;
}) {
  const Comp = component as React.ComponentType<Record<string, unknown>>;
  return (
    <Suspense
      fallback={
        fallback ?? <p className="extension-slot__fallback text-sm text-ink-muted">Memuat...</p>
      }
    >
      <div className="extension-slot">
        <Comp {...props} />
      </div>
    </Suspense>
  );
}

/** Resolve permission — dipakai sebelum merender item dari registry. */
export function canRender(permission?: string): boolean {
  return hasPermission(permission);
}
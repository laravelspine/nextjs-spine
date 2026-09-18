"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

/**
 * Layout group `(app)` — gerbang login untuk SEMUA halaman dalam group
 * (dashboard, profile, settings, contoh halaman, modul demo). Ini titik
 * tunggal "login-required": saat user null, group ini tidak merender konten.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-ink-muted">Memuat...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-xl border border-line-soft bg-surface-raised p-6 text-center">
          <p className="text-sm font-medium text-ink">Perlu login untuk membuka halaman ini</p>
          <p className="mt-1 text-xs text-ink-muted">
            Contoh halaman dan modul memerlukan token Sanctum.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-strong"
          >
            Masuk
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
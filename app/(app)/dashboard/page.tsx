"use client";

import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/lib/ui";
import { DashboardGrid } from "@/lib/dashboard-grid";

/**
 * /dashboard — halaman dashboard core dengan drag-and-drop.
 * Semua widget (CORE + modul) di-render oleh DashboardGrid dari registry
 * /api/v1/modules/extensions. State layout & visibility tersimpan per-user.
 */
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="dashboard space-y-8">
      <section className="dashboard-hero">
        <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
          Dashboard
        </p>
        <h1 className="dashboard-hero__title mt-1 text-3xl font-bold tracking-tight text-ink">
          Selamat datang kembali,{" "}
          <span className="text-accent-strong">{user?.name}</span>
        </h1>
        <p className="dashboard-hero__identity mt-2 flex items-center gap-2 text-sm text-ink-muted">
          <span>Login sebagai {user?.email}</span>
          <Badge tone="accent">id {user?.id}</Badge>
        </p>
      </section>

      <DashboardGrid />
    </div>
  );
}

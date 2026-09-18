"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Badge, Card, PageHeader, cx } from "@/lib/ui";
import { ExtensionSlot, t, useExtensions } from "@/lib/extensions";

/**
 * /profile — halaman core Profile.
 * Core mendefinisikan tab dasar (Overview/Security/Sessions); modul
 * menambah tab/section lewat UI Extension Registry (`profile.tabs`,
 * `profile.sections`) tanpa menyentuh file ini.
 */

interface ProfileTab {
  id: string;
  label: string;
  icon?: string;
  render: () => React.ReactNode;
}

function ProfileOverview() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <Card title="Overview">
      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-faint">Nama</div>
          <div className="mt-1 text-sm font-medium text-ink">{user.name}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-faint">Email</div>
          <div className="mt-1 text-sm text-ink">{user.email}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-faint">User ID</div>
          <div className="mt-1">
            <Badge tone="accent">id {user.id}</Badge>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-faint">Status</div>
          <div className="mt-1">
            <Badge tone="success">Aktif</Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ProfileSecurity() {
  return (
    <Card title="Security">
      <p className="text-sm text-ink-muted">
        Ubah sandi, 2FA, dan recovery code ditangani oleh backend/modul
        keamanan. Core hanya menyediakan wadah — modul dapat mendaftarkan
        section sendiri lewat <code className="text-accent-strong">profile.sections</code>.
      </p>
      <div className="mt-4 space-y-3">
        {[
          ["Ubah sandi", "Belum terhubung ke API"],
          ["Autentikasi dua langkah", "Belum terhubung ke API"],
          ["Recovery code", "Belum terhubung ke API"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-lg border border-line-soft px-3 py-2"
          >
            <span className="text-sm text-ink">{label}</span>
            <span className="text-xs text-ink-faint">{value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ProfileSessions() {
  return (
    <Card title="Sessions">
      <p className="text-sm text-ink-muted">
        Daftar sesi aktif (perangkat + lokasi) bisa diekspos modul/endpoint
        backend. Saat ini daftar sesi belum tersedia di API /api/v1.
      </p>
      <div className="mt-4 rounded-lg border border-dashed border-line-soft px-4 py-6 text-center text-sm text-ink-faint">
        Belum ada daftar sesi.
      </div>
    </Card>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const extTabs = useExtensions("profile.tabs");
  const sections = useExtensions("profile.sections");

  const coreTabs: ProfileTab[] = [
    { id: "overview", label: "Overview", render: () => <ProfileOverview /> },
    { id: "security", label: "Security", render: () => <ProfileSecurity /> },
    { id: "sessions", label: "Sessions", render: () => <ProfileSessions /> },
  ];

  const extTabDefs: ProfileTab[] = extTabs.map((e) => ({
    id: e.id,
    label: t(e.label),
    icon: e.icon,
    render: () => <ExtensionSlot component={e.component} />,
  }));

  const tabs = [...coreTabs, ...extTabDefs];
  const [active, setActive] = useState<string>(tabs[0]?.id ?? "");

  // Dukung deep-link /profile#referrals → buka tab ekstensi.
  useEffect(() => {
    const h = window.location.hash.replace("#", "");
    if (h && tabs.some((tb) => tb.id === h)) setActive(h);
  }, [tabs, active]);

  const activeTab = tabs.find((tb) => tb.id === active) ?? tabs[0];

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" desc="Halaman core — tab modul disisipkan di sini." />

      <div className="rounded-xl border border-line-soft bg-surface-raised p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent-soft text-2xl font-bold text-accent-strong">
            {(user?.name ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-ink">{user?.name}</h2>
            <p className="truncate text-sm text-ink-muted">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex w-full shrink-0 gap-2 lg:w-56 lg:flex-col">
          {tabs.map((tb) => {
            const isActive = tb.id === active;
            return (
              <button
                key={tb.id}
                type="button"
                onClick={() => setActive(tb.id)}
                className={cx(
                  "flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  isActive
                    ? "border-accent/40 bg-accent-soft text-accent-strong"
                    : "border-line-soft bg-surface-overlay text-ink-muted hover:text-ink"
                )}
              >
                {tb.icon && <span className="text-base">{tb.icon}</span>}
                {tb.label}
                {!coreTabs.some((c) => c.id === tb.id) && (
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-accent-strong">
                    modul
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1">
          {activeTab && activeTab.render()}
          {active === "overview" && sections.length > 0 && (
            <div className="mt-6 space-y-4">
              {sections.map((s) => (
                <ExtensionSlot key={s.id} component={s.component} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
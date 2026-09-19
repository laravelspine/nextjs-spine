"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { useModuleExtensions } from "@/lib/module-extensions";
import { Badge, Button, Card, PageHeader } from "@/lib/ui";
import Link from "next/link";

/**
 * /profile — halaman core Profile.
 *
 * Pola manifest-based (seperti Settings): tab dasar di-core, tab module
 * datang dari manifest `profile_tabs[]` via GET /api/v1/modules/extensions.
 * Core tidak perlu tahu detail module — cukup render apa yang dikirim.
 */

interface TabItem {
  slug: string;
  label: string;
  icon?: string;
  href: string;
  module?: string;
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
        keamanan. Core hanya menyediakan wadah.
      </p>
      <div className="mt-4 space-y-3">
        {[
          ["Ubah sandi", "Belum terhubung ke API"],
          ["Autentikasi dua langkah", "Belum terhubung ke API"],
          ["Recovery code", "Belum terhubung ke API"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="security-row flex items-center justify-between rounded-lg border border-line-soft px-3 py-2"
          >
            <span className="security-row__label text-sm text-ink">{label}</span>
            <span className="security-row__value text-xs text-ink-faint">{value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ProfileLanguage() {
  const { locale, setLocale } = useI18n();
  const [currentLang, setCurrentLang] = useState(locale);

  const languages = [
    { value: "en", label: "English" },
    { value: "id", label: "Indonesia" },
    { value: "ko", label: "한국어" },
    { value: "zh", label: "中文" },
    { value: "ja", label: "日本語" },
  ];

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value as typeof locale;
    setCurrentLang(val);
    setLocale(val);
  }

  return (
    <Card title="Language">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">
            Choose your preferred language
          </label>
          <select
            value={currentLang}
            onChange={handleChange}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-ink-faint">
          Language preference is saved locally. Backend settings will be added soon.
        </p>
      </div>
    </Card>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { profile_tabs: extTabs } = useModuleExtensions();

  // Tab core (hardcode di profile-web, bukan module)
  const coreTabs: TabItem[] = [
    { slug: "overview", label: t("profile.overview"), icon: "👤", href: "/profile" },
    { slug: "security", label: t("profile.security"), icon: "🔒", href: "/profile/security" },
    { slug: "language", label: t("profile.language"), icon: "🌐", href: "/profile/language" },
  ];

  // Gabungkan core + module tabs, urutkan by position
  const allTabs: TabItem[] = [
    ...coreTabs,
    ...extTabs.map((e) => ({
      slug: e.slug,
      label: e.label,
      icon: e.icon,
      href: e.href,
      module: e.module,
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("profile.title")} desc={t("profile.description")} />

      <div className="profile-card rounded-xl border border-line-soft bg-surface-raised p-5">
        <div className="profile-card__body flex items-center gap-4">
          <div className="profile-card__avatar flex h-14 w-14 items-center justify-center rounded-xl bg-accent-soft text-2xl font-bold text-accent-strong">
            {(user?.name ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="profile-card__identity min-w-0">
            <h2 className="truncate text-lg font-semibold text-ink">{user?.name}</h2>
            <p className="truncate text-sm text-ink-muted">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="profile-tabs flex w-full shrink-0 gap-2 lg:w-56 lg:flex-col">
          {allTabs.map((tb) => {
            const isCore = !tb.module;
            return (
              <Link
                key={tb.slug}
                href={tb.href}
                className={
                  "profile-tabs__tab flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors " +
                  (isCore
                    ? "border-line-soft bg-surface-overlay text-ink-muted hover:text-ink"
                    : "border-line-soft bg-surface-raised text-ink-muted hover:text-ink")
                }
              >
                {tb.icon && <span className="text-base">{tb.icon}</span>}
                {tb.label}
                {!isCore && (
                  <span className="profile-tabs__modul-tag ml-auto text-[10px] uppercase tracking-wider text-accent-strong">
                    modul
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1">
          {/* Core tab content — Section component dipindahkan ke Overview */}
          <ProfileOverview />
        </div>
      </div>
    </div>
  );
}
"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/lib/ui";
import { useI18n } from "@/lib/i18n-context";
import { ExtensionSlot, t as tExt, useExtensions } from "@/lib/extensions";
import Link from "next/link";

/** Tab core Profile — tetap di-core, bukan berasal dari modul. */
interface TabItem {
  slug: string;
  href: string;
  icon: string;
  labelKey: string;
  label?: string | { namespace: string; key: string };
}

const CORE_TABS: TabItem[] = [
  { slug: "overview", href: "/profile/overview", icon: "👤", labelKey: "profile.overview" },
  { slug: "security", href: "/profile/security", icon: "🔒", labelKey: "profile.security" },
  { slug: "language", href: "/profile/language", icon: "🌐", labelKey: "profile.language" },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useI18n();
  // Tab ekstensi UI dari modul frontend (register via context.ui.tabs.register).
  const extTabs = useExtensions("profile.tabs");

  const allTabs = [...CORE_TABS, ...extTabs.map((e) => ({
    slug: e.id,
    href: `/profile/${e.id}`,
    icon: e.icon ?? "📄",
    label: typeof e.label === "string" ? e.label : { namespace: e.label.namespace, key: e.label.key },
    _ext: e,
  }))];

  const activeSlug = allTabs.find((tb) => pathname.startsWith(tb.href))?.slug ?? null;
  const activeExt = extTabs.find((e) => pathname === `/profile/${e.id}` || pathname.startsWith(`/profile/${e.id}/`));

  return (
    <div className="space-y-6">
      <PageHeader title={t("profile.title")} desc={t("profile.description")} />

      {user && (
        <div className="profile-card rounded-xl border border-line-soft bg-surface-raised p-5">
          <div className="profile-card__body flex items-center gap-4">
            <div className="profile-card__avatar flex h-14 w-14 items-center justify-center rounded-xl bg-accent-soft text-2xl font-bold text-accent-strong">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-card__identity min-w-0">
              <h2 className="truncate text-lg font-semibold text-ink">{user.name}</h2>
              <p className="truncate text-sm text-ink-muted">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="profile-tabs flex w-full shrink-0 gap-2 lg:w-56 lg:flex-col">
          {allTabs.map((tb) => {
            const isActive = activeSlug === tb.slug;
            const isExt = "_ext" in tb;
            return (
              <Link
                key={tb.slug}
                href={tb.href}
                className={
                  "profile-tabs__tab flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors " +
                  (isActive
                    ? "border-accent/40 bg-accent-soft text-accent-strong"
                    : "border-line-soft bg-surface-overlay text-ink-muted hover:text-ink")
                }
              >
                <span className="text-base">{tb.icon}</span>
                <span>{tExt(tb.label ?? (tb as TabItem).labelKey)}</span>
                {isExt && (
                  <span className="profile-tabs__modul-tag ml-auto text-[10px] uppercase tracking-wider text-accent-strong">
                    modul
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1">
          {activeExt ? (
            <ExtensionSlot
              component={activeExt.component}
              fallback={<p className="text-sm text-ink-muted">Memuat...</p>}
            />
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}


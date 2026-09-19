"use client";

import { usePathname } from "next/navigation";
import { useModuleExtensions } from "@/lib/module-extensions";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/lib/ui";
import { useI18n } from "@/lib/i18n-context";
import Link from "next/link";

/** Tab core Profile — tetap di-core, bukan berasal dari modul. */
interface TabItem {
  slug: string;
  href: string;
  icon: string;
  labelKey: string;
  isModule?: boolean;
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
  const { profile_tabs: extTabs } = useModuleExtensions();

  // Tab dari manifest modul aktif.
  const moduleTabs = extTabs.map((tab) => ({
    slug: tab.slug,
    href: tab.href,
    icon: tab.icon ?? "📄",
    labelKey: tab.label,
    isModule: true,
  }));

  const allTabs = [...CORE_TABS, ...moduleTabs];

  const activeSlug = allTabs.find((tb) => pathname.startsWith(tb.href))?.slug ?? null;

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
                <span>{typeof tb.labelKey === "string" ? tb.labelKey : t(tb.labelKey)}</span>
                {tb.isModule && (
                  <span className="profile-tabs__modul-tag ml-auto text-[10px] uppercase tracking-wider text-accent-strong">
                    modul
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

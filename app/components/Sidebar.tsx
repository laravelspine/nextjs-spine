"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModuleExtensions } from "@/lib/module-extensions";
import { useAuth } from "@/lib/auth-context";
import { useExtensions, t } from "@/lib/extensions";
import { useI18n } from "@/lib/i18n-context";
import { cx } from "@/lib/ui";

const core = [
  { href: "/", key: "nav.home" },
  { href: "/dashboard", key: "nav.dashboard" },
  { href: "/profile", key: "nav.profile" },
  { href: "/api", key: "nav.api" },
  { href: "/hooks", key: "nav.hooks" },
  { href: "/users", key: "nav.users" },
  { href: "/rbac", key: "nav.rbac" },
  { href: "/modules", key: "nav.modules" },
];

const examples = [
  { href: "/settings", key: "nav.settings" },
  { href: "/meta", key: "nav.meta" },
  { href: "/tags", key: "nav.tags" },
  { href: "/qr-code", key: "nav.qr_code" },
  { href: "/number-to-word", key: "nav.number_to_word" },
  { href: "/pdf", key: "nav.pdf" },
  { href: "/activity-logs", key: "nav.activity_logs" },
];

function Item({ href, label, icon }: { href: string; label: string; icon?: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={cx(
        "sidebar__item flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-accent-soft font-medium text-accent-strong"
          : "text-ink-muted hover:bg-surface-overlay hover:text-ink"
      )}
    >
      {icon && <span className="text-xs">{icon}</span>}
      {label}
    </Link>
  );
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="sidebar__group-title px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
      {children}
    </div>
  );
}

export default function Sidebar() {
  const { user, loading } = useAuth();
  const { menu: moduleMenu } = useModuleExtensions();
  const navExt = useExtensions("navigation.main");
  const { locale, setLocale, t } = useI18n();

  return (
    <aside className="sidebar flex w-60 shrink-0 flex-col border-r border-line-soft bg-surface-raised">
      <div className="sidebar__brand px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Spine<span className="text-accent">.</span>
        </Link>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as any)}
          className="sidebar__locale text-xs rounded-md border border-line bg-surface-raised px-2 py-1 text-ink-muted focus:border-accent focus:outline-none"
          title="Language"
        >
          <option value="en">EN</option>
          <option value="id">ID</option>
          <option value="ko">한국어</option>
          <option value="zh">中文</option>
          <option value="ja">日本語</option>
        </select>
      </div>

      <nav className="sidebar__nav flex-1 space-y-6 overflow-y-auto px-3 py-2">
        <div className="sidebar__group space-y-1">
          <GroupTitle>Spine</GroupTitle>
          {core.map((i) => (
            <Item key={i.href} href={i.href} label={t(i.key)} />
          ))}
        </div>

        {user && (
          <div className="sidebar__group space-y-1">
            <GroupTitle>{t("nav.examples")}</GroupTitle>
            {examples.map((i) => (
              <Item key={i.href} href={i.href} label={t(i.key)} />
            ))}
          </div>
        )}

        {moduleMenu.length > 0 && (
          <div className="sidebar__group space-y-1">
            <GroupTitle>{t("nav.modules")}</GroupTitle>
            {moduleMenu.map((i) => (
              <Item key={i.slug} href={i.href} label={i.label} />
            ))}
          </div>
        )}

        {navExt.length > 0 && (
          <div className="sidebar__group space-y-1">
            <GroupTitle>{t("nav.extensions")}</GroupTitle>
            {navExt.map((i) => (
              <Item key={i.id} href={i.href} label={typeof i.label === "string" ? i.label : i.label.key} icon={i.icon} />
            ))}
          </div>
        )}
      </nav>

      <div className="sidebar__footer border-t border-line-soft px-3 py-3">
        {loading || user ? null : (
          <div className="space-y-2">
            <Link
              href="/login"
              className="block rounded-md border border-line px-3 py-1.5 text-center text-sm text-ink-muted transition-colors hover:border-accent/50 hover:text-accent-strong"
            >
              {t("nav.login")}
            </Link>
            <Link
              href="/register"
              className="block rounded-md bg-accent px-3 py-1.5 text-center text-sm font-medium text-accent-ink transition-colors hover:bg-accent-strong"
            >
              {t("nav.register")}
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

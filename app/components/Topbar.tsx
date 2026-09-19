"use client";

import { usePathname } from "next/navigation";
import { ThemeToggleButton } from "./ThemeToggleButton";
import UserDropdown from "./UserDropdown";
import { NotificationButton } from "./NotificationButton";
import { useI18n } from "@/lib/i18n-context";

const titles: Record<string, string> = {
  "/": "nav.home",
  "/dashboard": "nav.dashboard",
  "/profile": "nav.profile",
  "/api": "nav.api",
  "/hooks": "nav.hooks",
  "/tenants": "nav.tenants",
  "/settings": "nav.settings",
  "/meta": "nav.meta",
  "/tags": "nav.tags",
  "/qr-code": "nav.qr_code",
  "/number-to-word": "nav.number_to_word",
  "/pdf": "nav.pdf",
  "/activity-logs": "nav.activity_logs",
  "/users": "nav.users",
  "/rbac": "nav.rbac",
  "/modules": "nav.modules",
  "/login": "nav.login",
  "/register": "nav.register",
};

export default function Topbar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const title = titles[pathname] ?? pathname;
  const displayTitle = title.startsWith("nav.") ? t(title) : title;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line-soft bg-surface px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-ink-faint">Spine</span>
        <span className="text-ink-faint">/</span>
        <span className="font-medium text-ink">{displayTitle}</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggleButton />
        <NotificationButton />
        <UserDropdown />
      </div>
    </header>
  );
}

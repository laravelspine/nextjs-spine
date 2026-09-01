"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/api": "API",
  "/hooks": "Hook",
  "/tenants": "Tenant",
  "/settings": "Settings",
  "/meta": "Meta",
  "/tags": "Tags",
  "/qr-code": "QR Code",
  "/number-to-word": "Number to Word",
  "/pdf": "PDF",
  "/activity-logs": "Activity Logs",
  "/login": "Login",
  "/register": "Register",
};

export default function Topbar() {
  const pathname = usePathname();
  const title = titles[pathname] ?? pathname;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line-soft bg-surface px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-ink-faint">Spine</span>
        <span className="text-ink-faint">/</span>
        <span className="font-medium text-ink">{title}</span>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModuleExtensions } from "@/lib/module-extensions";
import { useAuth } from "@/lib/auth-context";
import { cx } from "@/lib/ui";

const core = [
  { href: "/", label: "Beranda" },
  { href: "/api", label: "API" },
  { href: "/hooks", label: "Hook" },
  { href: "/tenants", label: "Tenant" },
];

const examples = [
  { href: "/settings", label: "Settings" },
  { href: "/meta", label: "Meta" },
  { href: "/tags", label: "Tags" },
  { href: "/qr-code", label: "QR Code" },
  { href: "/number-to-word", label: "Number to Word" },
  { href: "/pdf", label: "PDF" },
  { href: "/activity-logs", label: "Activity Logs" },
];

function Item({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={cx(
        "block rounded-md px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-accent-soft font-medium text-accent-strong"
          : "text-ink-muted hover:bg-surface-overlay hover:text-ink"
      )}
    >
      {label}
    </Link>
  );
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
      {children}
    </div>
  );
}

export default function Sidebar() {
  const { user, loading } = useAuth();
  const { menu: moduleMenu } = useModuleExtensions();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line-soft bg-surface-raised">
      <div className="px-4 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Spine<span className="text-accent">.</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          <GroupTitle>Spine</GroupTitle>
          {core.map((i) => (
            <Item key={i.href} {...i} />
          ))}
        </div>

        {user && (
          <div className="space-y-1">
            <GroupTitle>Contoh halaman</GroupTitle>
            {examples.map((i) => (
              <Item key={i.href} {...i} />
            ))}
          </div>
        )}

        {moduleMenu.length > 0 && (
          <div className="space-y-1">
            <GroupTitle>Modul</GroupTitle>
            {moduleMenu.map((i) => (
              <Item key={i.slug} href={i.href} label={i.label} />
            ))}
          </div>
        )}
      </nav>

      <div className="border-t border-line-soft px-3 py-3">
        {loading || user ? null : (
          <div className="space-y-2">
            <Link
              href="/login"
              className="block rounded-md border border-line px-3 py-1.5 text-center text-sm text-ink-muted transition-colors hover:border-accent/50 hover:text-accent-strong"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="block rounded-md bg-accent px-3 py-1.5 text-center text-sm font-medium text-accent-ink transition-colors hover:bg-accent-strong"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

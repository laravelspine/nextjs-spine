"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

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
      className={
        "block rounded-md px-3 py-1.5 text-sm transition-colors " +
        (active
          ? "bg-emerald-500/15 text-emerald-400 font-medium"
          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60")
      }
    >
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  async function onLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="px-4 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Spine<span className="text-emerald-400">.</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
            Spine
          </div>
          {core.map((i) => (
            <Item key={i.href} {...i} />
          ))}
        </div>

        {user && (
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
              Contoh halaman
            </div>
            {examples.map((i) => (
              <Item key={i.href} {...i} />
            ))}
          </div>
        )}
      </nav>

      <div className="border-t border-zinc-800 px-3 py-3">
        {loading ? null : user ? (
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-zinc-200">{user.name}</div>
              <div className="truncate text-xs text-zinc-500">{user.email}</div>
            </div>
            <button
              onClick={onLogout}
              className="shrink-0 rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:border-red-500/50 hover:text-red-400 transition-colors"
            >
              Keluar
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              href="/login"
              className="block rounded-md border border-zinc-700 px-3 py-1.5 text-center text-sm text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="block rounded-md bg-emerald-500 px-3 py-1.5 text-center text-sm font-medium text-zinc-950 hover:bg-emerald-400 transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

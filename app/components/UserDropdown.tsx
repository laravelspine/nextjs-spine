"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function UserDropdown() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  if (!user) return null;

  const initial = (user.name ?? "?").charAt(0).toUpperCase();

  async function onLogout() {
    setOpen(false);
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Menu user"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-line-soft bg-surface-raised font-semibold text-accent-strong transition-colors hover:text-accent"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-line-soft bg-surface-raised shadow-lg">
          <div className="border-b border-line-soft px-4 py-3">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-faint">{user.email}</p>
          </div>
          <div className="p-1.5">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-overlay hover:text-ink"
            >
              Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-overlay hover:text-ink"
            >
              Settings
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-danger-soft"
            >
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

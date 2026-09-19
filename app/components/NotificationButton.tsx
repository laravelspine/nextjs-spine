"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notifications";
import type { SpineNotification } from "@/lib/notifications";
import { realtimeStart, realtimeStop } from "@/lib/realtime";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff) || diff < 0) return "";
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "baru saja";
  if (min < 60) return `${min} mnt`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam`;
  const day = Math.floor(hr / 24);
  return `${day} hari`;
}

export function NotificationButton() {
  const { user } = useAuth();
  const router = useRouter();
  const { items, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const userId = user?.id;

  // Realtime (Reverb): konek saat user login, putus saat logout.
  useEffect(() => {
    if (!userId) return;
    realtimeStart(Number(userId));
    return () => realtimeStop();
  }, [userId]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  async function onItemClick(n: SpineNotification) {
    setOpen(false);
    if (!n.read_at) await markRead(n.id);
    if (n.data.url) {
      if (n.data.url.startsWith("/")) router.push(n.data.url);
      else window.open(n.data.url, "_blank", "noopener");
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => user && setOpen(!open)}
        aria-label="Notifikasi"
        className="notification-button flex h-10 w-10 items-center justify-center rounded-lg border border-line-soft bg-surface-raised text-ink-muted transition-colors hover:text-ink"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="notification-button__badge absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-semibold leading-none text-white ring-2 ring-surface"
            aria-label={`${unreadCount} belum dibaca`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && user && (
        <div className="notification-dropdown absolute right-0 top-12 z-50 w-[22rem] overflow-hidden rounded-xl border border-line-soft bg-surface-raised shadow-lg">
          <div className="notification-dropdown__header flex items-center justify-between border-b border-line-soft px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Notifikasi</p>
              <p className="text-xs text-ink-faint">
                {unreadCount > 0
                  ? `${unreadCount} belum dibaca`
                  : "Semua sudah dibaca"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  markAllRead();
                }}
                className="notification-dropdown__mark-all text-xs font-medium text-accent-strong hover:underline"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="notification-dropdown__list max-h-80 overflow-y-auto">
            {loading && items.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-ink-faint">Memuat...</p>
            )}
            {!loading && items.length === 0 && (
              <p className="notification-dropdown__empty px-4 py-6 text-center text-sm text-ink-faint">
                Tidak ada notifikasi
              </p>
            )}
            {items.map((n) => {
              const unread = !n.read_at;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onItemClick(n)}
                  className={`notification-dropdown__item block w-full border-b border-line-soft/60 px-4 py-3 text-left transition-colors hover:bg-surface-overlay ${
                    unread ? "notification-dropdown__item--unread bg-accent-soft/40" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className={`notification-dropdown__item-title truncate text-sm ${
                          unread ? "font-semibold text-ink" : "text-ink-muted"
                        }`}
                      >
                        {n.data.title || "Notifikasi"}
                      </p>
                      {n.data.body && (
                        <p className="notification-dropdown__item-body mt-0.5 line-clamp-2 text-xs text-ink-faint">
                          {n.data.body}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {unread && (
                        <span className="h-2 w-2 rounded-full bg-accent-strong" aria-hidden />
                      )}
                      <span className="notification-dropdown__item-time text-[11px] text-ink-faint">
                        {relativeTime(n.created_at)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="notification-dropdown__footer border-t border-line-soft p-1.5">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-accent-strong transition-colors hover:bg-surface-overlay"
            >
              Lihat semua
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button, EmptyState, ErrorNotice, PageHeader } from "@/lib/ui";
import { useNotifications, normalize } from "@/lib/notifications";
import type { SpineNotification } from "@/lib/notifications";

type UnknownNotification = Omit<SpineNotification, "data"> & { data: unknown };

interface NotifPage {
  data: UnknownNotification[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    unread_count: number;
  };
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff) || diff < 0) return "";
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "baru saja";
  if (min < 60) return `${min} mnt`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam`;
  return `${Math.floor(hr / 24)} hari`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { markRead, markAllRead, refresh } = useNotifications();
  const [items, setItems] = useState<SpineNotification[]>([]);
  const [meta, setMeta] = useState<NotifPage["meta"] | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(p: number) {
    setError(null);
    setLoading(true);
    const res = await api<NotifPage>(
      `/api/v1/notifications?page=${p}&per_page=15`
    );
    if (!res.ok || !res.data?.data) {
      setError(res.error ?? "Gagal memuat notifikasi");
      setItems([]);
      setLoading(false);
      return;
    }
    setItems((res.data.data ?? []).map(normalize));
    setMeta(res.data.meta);
    setLoading(false);
  }

  useEffect(() => {
    load(page);
  }, [page]);

  async function onItemClick(n: SpineNotification) {
    if (!n.read_at) {
      await markRead(n.id);
      setItems((prev) =>
        prev.map((x) =>
          x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x
        )
      );
    }
    if (n.data.url) {
      if (n.data.url.startsWith("/")) router.push(n.data.url);
      else window.open(n.data.url, "_blank", "noopener");
    }
  }

  async function onMarkAll() {
    await markAllRead();
    setItems((prev) =>
      prev.map((x) => ({ ...x, read_at: x.read_at ?? new Date().toISOString() }))
    );
    setMeta((m) => (m ? { ...m, unread_count: 0 } : m));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Notifikasi"
        desc="Semua notifikasi yang dikirim ke akun Anda dari modul & sistem."
      />

      {meta && (
        <div className="notifications-toolbar flex items-center justify-between gap-3">
          <p className="text-sm text-ink-muted">
            {meta.total} total · {meta.unread_count} belum dibaca
          </p>
          {meta.unread_count > 0 && (
            <Button
              onClick={onMarkAll}
              variant="ghost"
              className="text-xs"
            >
              Tandai semua dibaca
            </Button>
          )}
        </div>
      )}

      {error && <ErrorNotice message={error} />}

      {loading && items.length === 0 ? (
        <p className="text-ink-muted">Memuat...</p>
      ) : items.length === 0 ? (
        <EmptyState message="Belum ada notifikasi." />
      ) : (
        <div className="notifications-list divide-y divide-line-soft rounded-xl border border-line-soft bg-surface-raised">
          {items.map((n) => {
            const unread = !n.read_at;
            return (
              <button
                key={n.id}
                onClick={() => onItemClick(n)}
                type="button"
                className={`notifications-list__item flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-overlay ${
                  unread ? "notifications-list__item--unread bg-accent-soft/40" : ""
                }`}
              >
                <span
                  className={`notifications-list__dot mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    unread ? "bg-accent-strong" : "bg-line-strong"
                  }`}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={`notifications-list__title block truncate text-sm ${
                      unread ? "font-semibold text-ink" : "text-ink-muted"
                    }`}
                  >
                    {n.data.title || "Notifikasi"}
                  </span>
                  {n.data.body && (
                    <span className="notifications-list__body mt-0.5 block text-xs text-ink-faint">
                      {n.data.body}
                    </span>
                  )}
                </span>
                <span className="notifications-list__time shrink-0 text-[11px] text-ink-faint">
                  {relativeTime(n.created_at)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {meta && meta.last_page > 1 && (
        <div className="notifications-pagination flex items-center justify-between">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            variant="secondary"
          >
            Sebelumnya
          </Button>
          <p className="text-xs text-ink-faint">
            Halaman {meta.current_page} dari {meta.last_page}
          </p>
          <Button
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            disabled={page >= meta.last_page}
            variant="secondary"
          >
            Berikutnya
          </Button>
        </div>
      )}

      <p className="text-center text-xs text-ink-faint">
        <button
          type="button"
          onClick={() => {
            refresh();
            load(page);
          }}
          className="hover:underline"
        >
          Muat ulang
        </button>
      </p>
    </div>
  );
}
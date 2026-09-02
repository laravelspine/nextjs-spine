"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { cx } from "@/lib/ui";

/** Badge status berwarna (padanan label status legacy) — dipakai TabContent list. */
function statusPill(status: string): React.ReactNode {
  const cls =
    status === "done"
      ? "bg-emerald-100 text-emerald-700"
      : status === "in_progress"
        ? "bg-amber-100 text-amber-700"
        : status === "pending"
          ? "bg-slate-100 text-slate-600"
          : "bg-slate-100 text-slate-600";
  return (
    <span className={"rounded-full px-2 py-0.5 text-xs font-medium " + cls}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

/**
 * Kontrak tab detail dari manifest modul (detail_tabs[]).
 * Padanan App_tabs::add_customer_profile_tab($slug, $tab) legacy:
 * slug/name/icon/position + api (pengganti 'view' — konten di-fetch).
 */
export interface DetailTab {
  slug: string;
  label: string;
  icon?: string;
  api: string; // path dengan placeholder {id}, mis. /api/v1/sample/{id}/overview
  position?: number;
}

export interface MasterDetailItem {
  id: number | string;
  name?: string;
}

/**
 * MasterDetail — helper generik list + panel kanan bertab (induk).
 *
 * Dipakai SEMUA modul (inspections, billings, licences, sample, ...) supaya
 * tidak ada perulangan: core merender apa yang dikirim kontrak, modul cukup
 * isi items + detail_tabs. Padanan legacy client.php + tabs.php.
 */
export function MasterDetail({
  items,
  tabs,
  getItemKey = (it) => it.id,
  getItemLabel = (it) => it.name ?? String(it.id),
  getTabUrl = (it, tab) => tab.api.replace("{id}", String(it.id)),
  emptyText = "Tidak ada item.",
  tabEmptyText = "Tidak ada data.",
}: {
  items: MasterDetailItem[];
  tabs: DetailTab[];
  getItemKey?: (item: MasterDetailItem) => string | number;
  getItemLabel?: (item: MasterDetailItem) => string;
  getTabUrl?: (item: MasterDetailItem, tab: DetailTab) => string;
  emptyText?: string;
  tabEmptyText?: string;
}) {
  const sortedTabs = [...tabs].sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
  const [selectedId, setSelectedId] = useState<string | number | null>(
    items.length > 0 ? getItemKey(items[0]) : null
  );
  const [activeTab, setActiveTab] = useState<string>(sortedTabs[0]?.slug ?? "");

  // Reset pilihan kalau list berubah (mis. item baru ditambahkan).
  useEffect(() => {
    if (items.length > 0 && !items.some((it) => getItemKey(it) === selectedId)) {
      setSelectedId(getItemKey(items[0]));
    }
  }, [items, getItemKey, selectedId]);

  const selected = items.find((it) => getItemKey(it) === selectedId) ?? null;
  const tab = sortedTabs.find((t) => t.slug === activeTab) ?? sortedTabs[0] ?? null;

  return (
    <div className="flex min-h-0 flex-col gap-4 lg:flex-row">
      {/* List (kiri) — padanan manage.php */}
      <div className="w-full shrink-0 lg:w-72">
        <div className="overflow-hidden rounded-xl border border-line-soft bg-surface-raised">
          {items.length === 0 ? (
            <p className="p-4 text-sm text-ink-muted">{emptyText}</p>
          ) : (
            <ul className="max-h-[70vh] divide-y divide-line-soft overflow-y-auto">
              {items.map((it) => {
                const key = getItemKey(it);
                const active = key === selectedId;
                return (
                  <li key={String(key)}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(key)}
                      className={cx(
                        "block w-full px-4 py-3 text-left text-sm transition-colors",
                        active
                          ? "bg-accent-soft text-accent-strong"
                          : "text-ink hover:bg-surface-overlay hover:text-ink"
                      )}
                    >
                      <span className="font-medium">{getItemLabel(it)}</span>
                      <span className="ml-1 text-xs text-ink-faint">#{String(key)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Panel kanan (detail + tab) — padanan client.php */}
      <div className="min-w-0 flex-1">
        {!selected ? (
          <div className="rounded-xl border border-line-soft bg-surface-raised p-6 text-sm text-ink-muted">
            {emptyText}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line-soft bg-surface-raised">
            {/* Header: #ID + label */}
            <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
              <h2 className="text-base font-semibold text-ink">
                #{String(getItemKey(selected))} {getItemLabel(selected)}
              </h2>
            </div>

            {/* Nav tabs — padanan tabs.php */}
            {sortedTabs.length > 0 && (
              <nav className="flex flex-wrap gap-1 border-b border-line-soft px-3 py-2">
                {sortedTabs.map((t) => {
                  const isActive = t.slug === activeTab;
                  return (
                    <button
                      key={t.slug}
                      type="button"
                      onClick={() => setActiveTab(t.slug)}
                      className={cx(
                        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                        isActive
                          ? "bg-accent-soft font-medium text-accent-strong"
                          : "text-ink-muted hover:bg-surface-overlay hover:text-ink"
                      )}
                    >
                      {t.icon && <span className="text-xs">{t.icon}</span>}
                      {t.label}
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Konten tab — padanan $tab['view'] (fetch tab.api) */}
            <div className="p-5">
              {tab ? <TabContent url={getTabUrl(selected, tab)} emptyText={tabEmptyText} /> : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function TabContent({
  url,
  emptyText,
  refreshKey = 0,
  hideKeys = [],
  customValue,
}: {
  url: string;
  emptyText: string;
  /** Naikkan untuk paksa refetch meski url sama (setelah edit/submit). */
  refreshKey?: number;
  /** Field yang disembunyikan (mis. ulid — sistem-only, title — sudah di header). */
  hideKeys?: string[];
  /** Render custom per field (mis. sample_item_id → title parent). */
  customValue?: Record<string, (value: unknown, row: Record<string, unknown>) => React.ReactNode>;
}) {
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api<{ data?: unknown }>(url)
      .then((res) => {
        if (res.ok) setData(res.data?.data ?? res.data);
        else setError(res.error ?? "Gagal memuat");
      })
      .catch(() => setError("Gagal memuat"))
      .finally(() => setLoading(false));
  }, [url, refreshKey]);

  if (loading) return <p className="text-sm text-ink-muted">Memuat...</p>;
  if (error) return <p className="text-sm text-danger">{error}</p>;

  const rows = Array.isArray(data) ? data : data ? [data] : [];
  if (rows.length === 0) return <p className="text-sm text-ink-muted">{emptyText}</p>;

  // ARRAY -> tabel (list: tasks, activity, ...). OBJEK TUNGGAL -> vertical dl (overview).
  if (Array.isArray(data)) {
    const objs = rows as Record<string, unknown>[];
    const keys = [...new Set(objs.flatMap((o) => Object.keys(o)))].filter(
      (k) => !hideKeys.includes(k)
    );
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line-soft text-left text-xs uppercase tracking-wider text-ink-faint">
              {keys.map((k) => (
                <th key={k} className="px-3 py-2 font-medium">
                  {k.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {objs.map((o, i) => (
              <tr key={i}>
                {keys.map((k) => (
                  <td key={k} className="px-3 py-2 align-top text-ink">
                    {customValue?.[k]
                      ? customValue[k](o[k], o)
                      : k === "status" && typeof o[k] === "string"
                        ? statusPill(String(o[k]))
                        : o[k] === null || o[k] === ""
                          ? "—"
                          : String(o[k])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((r, i) => {
        const obj = r as Record<string, unknown>;
        const fields = Object.entries(obj).filter(([k]) => !hideKeys.includes(k));
        return (
          <dl key={i} className="divide-y divide-line-soft">
            {fields.map(([k, v]) => (
              <div key={k} className="flex gap-4 py-2">
                <dt className="w-36 shrink-0 text-xs uppercase tracking-wider text-ink-faint">
                  {k.replace(/_/g, " ")}
                </dt>
                <dd className="text-sm text-ink">
                  {customValue?.[k] ? customValue[k](v, obj) : v === null || v === "" ? "—" : String(v)}
                </dd>
              </div>
            ))}
          </dl>
        );
      })}
    </div>
  );
}

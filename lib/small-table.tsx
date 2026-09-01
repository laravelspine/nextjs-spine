"use client";

import { useState } from "react";
import { TabContent, type DetailTab } from "@/lib/master-detail";
import { cx } from "@/lib/ui";

/**
 * SmallTable — helper generik list + panel detail (padanan legacy
 * load_small_table_item() + toggle_small_view() di assets/js/main.js).
 *
 * Pola legacy:
 *   - klik baris → load_small_table_item(id) → do_hash_helper(id) → URL #id
 *   - toggle_small_view() → tabel col-md-12→col-md-5 (kolom sekunder
 *     disembunyikan), panel detail col-md-7 muncul di kanan
 *   - init_quotation(id) = 1 baris wrapper per modul
 *
 * SEMANTIC CLASS NAMES — dipakai sebagai bahasa diskusi:
 *   small-table                     wrapper utama (grid list + detail)
 *   small-table-list                kolom kiri (DataTable)
 *   small-table-list-row            baris tabel
 *   small-table-list-row--selected  baris terpilih
 *   small-table-list-col            sel tabel
 *   small-table-list-col--primary   sel kolom utama (ID/Nama — selalu tampil)
 *   small-table-detail              kolom kanan (panel detail)
 *   small-table-detail-header       header panel (#id + nama)
 *   small-table-tabs                nav tab
 *   small-table-tab                 tombol tab
 *   small-table-tab--active         tab aktif
 *   small-table-detail-body         konten tab
 */

export interface SmallTableColumn<T> {
  key: string;
  label: string;
  /** Kolom utama — tetap tampil saat mode kecil (padanan kolom non-hidden_columns). */
  primary?: boolean;
  render: (item: T) => React.ReactNode;
}

export interface SmallTableProps<T> {
  items: T[];
  tabs: DetailTab[];
  columns: SmallTableColumn<T>[];
  selectedId: number | string | null;
  onSelectId: (id: number | string) => void;
  getItemId: (item: T) => number | string;
  getTabUrl?: (item: T, tab: DetailTab) => string;
  getItemTitle?: (item: T) => string;
  /** Toolbar di header panel detail (padanan btn-group quotations: Edit/PDF/Toggle). */
  toolbar?: (item: T) => React.ReactNode;
  /** Kontrol toggle small view (padanan toggle_small_view): false = tabel penuh tanpa panel. */
  showDetail?: boolean;
  /** Naikkan setelah edit/submit agar konten tab di-refetch (data baru tampil). */
  refreshKey?: number;
  /** Field yang disembunyikan di konten tab (mis. ulid — sistem-only, title — sudah di header). */
  tabHideKeys?: string[];
  /** Render custom per field di konten tab (mis. sample_item_id → title parent). */
  tabCustomValue?: Record<string, (value: unknown, row: Record<string, unknown>) => React.ReactNode>;
  /** Header panel detail kustom (default "#id title") — mis. STATUS | ID | TITLE. */
  renderHeader?: (item: T) => React.ReactNode;
  /** Kolom yang bisa di-search (key dari columns). Kosong = tanpa search box. */
  searchableKeys?: string[];
  /** Teks searchable per item (lebih fleksibel: gabungan title + parent name). */
  getSearchText?: (item: T) => string;
  /** Teks pencarian dari luar (opsional, controlled). */
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  /** Jumlah baris per halaman (setting tables_pagination_limit, default 10). */
  perPage?: number;
  emptyText?: string;
  tabEmptyText?: string;
}

export function SmallTable<T>({
  items,
  tabs,
  columns,
  selectedId,
  onSelectId,
  getItemId,
  getTabUrl = (item, tab) => tab.api.replace("{id}", String(getItemId(item))),
  getItemTitle = (item) => String((item as { name?: unknown }).name ?? getItemId(item)),
  toolbar,
  showDetail = true,
  refreshKey = 0,
  tabHideKeys = [],
  tabCustomValue,
  renderHeader,
  searchableKeys = [],
  getSearchText,
  searchValue,
  onSearchChange,
  perPage = 10,
  emptyText = "Tidak ada item.",
  tabEmptyText = "Tidak ada data.",
}: SmallTableProps<T>) {
  const sortedTabs = [...tabs].sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
  const [activeTab, setActiveTab] = useState<string>(sortedTabs[0]?.slug ?? "");
  const tab = sortedTabs.find((t) => t.slug === activeTab) ?? sortedTabs[0] ?? null;

  // Search (client-side) — filter items via getSearchText (atau searchableKeys).
  const [internalSearch, setInternalSearch] = useState("");
  const q = (searchValue ?? internalSearch).trim().toLowerCase();
  const setQ = onSearchChange ?? setInternalSearch;
  const filteredItems = q
    ? items.filter((it) => {
        if (getSearchText) {
          return getSearchText(it).toLowerCase().includes(q);
        }
        return searchableKeys.some((key) =>
          String((it as Record<string, unknown>)[key] ?? "")
            .toLowerCase()
            .includes(q)
        );
      })
    : items;

  const selected = filteredItems.find((it) => getItemId(it) === selectedId) ?? null;
  const smallTable = selected !== null && showDetail;

  // Pagination (setting tables_pagination_limit) — reset halaman saat search.
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredItems.slice((currentPage - 1) * perPage, currentPage * perPage);

  const primaryCols = columns.filter((c) => c.primary);
  // Mode kecil: hanya kolom primary (padanan hidden_columns legacy).
  const visibleCols = smallTable && primaryCols.length > 0 ? primaryCols : columns;

  return (
    <div className="small-table flex flex-col gap-4 lg:flex-row">
      {/* Kolom kiri: DataTable */}
      <div className={cx("small-table-list min-w-0", smallTable ? "lg:w-5/12" : "lg:w-full")}>
        {(getSearchText || searchableKeys.length > 0) && (
          <div className="small-table-search mb-3">
            <input
              type="search"
              value={searchValue ?? internalSearch}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari..."
              className="w-full rounded-lg border border-line-soft bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        )}
        <div className="overflow-hidden rounded-xl border border-line-soft bg-surface-raised">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs uppercase tracking-wider text-ink-faint">
                  {visibleCols.map((c) => (
                    <th key={c.key} className="px-3 py-2">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {pageItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleCols.length}
                      className="px-3 py-4 text-center text-ink-muted"
                    >
                      {emptyText}
                    </td>
                  </tr>
                ) : (
                  pageItems.map((it) => {
                    const id = getItemId(it);
                    const active = id === selectedId;
                    return (
                      <tr
                        key={String(id)}
                        onClick={() => onSelectId(id)}
                        className={cx(
                          "small-table-list-row cursor-pointer transition-colors",
                          active
                            ? "small-table-list-row--selected bg-accent-soft"
                            : "hover:bg-surface-overlay"
                        )}
                      >
                        {visibleCols.map((c) => (
                          <td
                            key={c.key}
                            className={cx(
                              "small-table-list-col px-3 py-2",
                              c.primary
                                ? "small-table-list-col--primary text-ink"
                                : "text-ink-muted"
                            )}
                          >
                            {c.render(it)}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Footer pagination — setting tables_pagination_limit */}
          {filteredItems.length > perPage && (
            <div className="small-table-pagination flex items-center justify-between border-t border-line-soft px-3 py-2 text-xs text-ink-muted">
              <span>
                {filteredItems.length === 0
                  ? "0"
                  : `${(currentPage - 1) * perPage + 1}-${Math.min(
                      currentPage * perPage,
                      filteredItems.length
                    )}`}{" "}
                dari {filteredItems.length}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="rounded px-2 py-1 hover:bg-surface-overlay disabled:opacity-40"
                >
                  ‹ Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="rounded px-2 py-1 hover:bg-surface-overlay disabled:opacity-40"
                >
                  Next ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kolom kanan: panel detail — hanya saat showDetail ON */}
      {selected && showDetail && (
        <div className="small-table-detail min-w-0 flex-1 lg:w-7/12">
          <div className="overflow-hidden rounded-xl border border-line-soft bg-surface-raised">
            <div className="small-table-detail-header flex items-center justify-between border-b border-line-soft px-5 py-4">
              <h2 className="text-sm font-semibold text-ink">
                {renderHeader ? (
                  renderHeader(selected)
                ) : (
                  <>
                    #{String(getItemId(selected))} {getItemTitle(selected)}
                  </>
                )}
              </h2>
              {toolbar && (
                <div className="small-table-toolbar flex items-center gap-2">
                  {toolbar(selected)}
                </div>
              )}
            </div>

            {sortedTabs.length > 0 && (
              <nav className="small-table-tabs flex flex-wrap gap-1 border-b border-line-soft px-3 py-2">
                {sortedTabs.map((t) => {
                  const isActive = t.slug === activeTab;
                  return (
                    <button
                      key={t.slug}
                      type="button"
                      onClick={() => setActiveTab(t.slug)}
                      className={cx(
                        "small-table-tab flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                        isActive
                          ? "small-table-tab--active bg-accent-soft font-medium text-accent-strong"
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

            <div className="small-table-detail-body p-5">
              {tab ? (
                <TabContent
                  url={getTabUrl(selected, tab)}
                  emptyText={tabEmptyText}
                  refreshKey={refreshKey}
                  hideKeys={tabHideKeys}
                  customValue={tabCustomValue}
                />
              ) : (
                <p className="text-sm text-ink-muted">{tabEmptyText}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

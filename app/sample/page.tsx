"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button, Card, ErrorNotice, Field, Input, PageHeader } from "@/lib/ui";
import { TabContent, type DetailTab } from "@/lib/master-detail";
import { useModuleExtensions } from "@/lib/module-extensions";
import { cx } from "@/lib/ui";

interface SampleItem {
  id: number;
  name: string;
  description?: string | null;
  quantity?: number;
  price?: string | number;
  created_at?: string;
}

// Kolom yang disembunyikan saat mode kecil (padanan hidden_columns legacy).
const HIDDEN_COLS = ["description", "price", "created_at"];

export default function SamplePage() {
  const [items, setItems] = useState<SampleItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { detail_tabs } = useModuleExtensions();
  const tabs: DetailTab[] = detail_tabs["sample"] ?? [];

  // Hash #id (padanan do_hash_helper legacy): pilih record dari URL.
  useEffect(() => {
    const h = Number(window.location.hash.replace("#", ""));
    if (h) setSelectedId(h);
  }, []);

  const load = useCallback(() => {
    api<{ data: SampleItem[] }>("/api/v1/sample").then((res) => {
      if (res.ok) {
        const d = res.data?.data ?? [];
        setItems(d);
        // Kalau belum ada pilihan, auto-pilih item pertama (padanan
        // quotation_id dari URL di legacy) + set hash.
        if (d.length > 0 && !window.location.hash) {
          setSelectedId(d[0].id);
        }
      }
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Pilih item: update state + URL hash (#id).
  function selectItem(id: number) {
    setSelectedId(id);
    window.location.hash = String(id);
  }

  async function onCreate() {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await api("/api/v1/sample", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          quantity: quantity === "" ? 0 : Number(quantity),
          price: price === "" ? 0 : Number(price),
        }),
      });
      if (!res.ok) {
        setError(res.error ?? "Gagal membuat");
        return;
      }
      setName("");
      setDescription("");
      setQuantity("");
      setPrice("");
      setOpen(false);
      const created = (res.data as SampleItem).id;
      await load();
      // Setelah create: pilih item baru → panel kanan muncul (padanan
      // load_small_table_item yang auto-toggle setelah create).
      selectItem(created);
    } catch {
      setError("Gagal membuat");
    } finally {
      setSaving(false);
    }
  }

  const sortedTabs = [...tabs].sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
  const tab = sortedTabs.find((t) => t.slug === activeTab) ?? sortedTabs[0] ?? null;
  const selected = items.find((it) => it.id === selectedId) ?? null;
  const smallTable = selected !== null; // mode kecil = ada record terpilih

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sample"
        desc="Halaman dari modul Sample — DataTable item, klik baris untuk detail bertab."
        action={
          <Button onClick={() => setOpen(true)}>Add Sample</Button>
        }
      />

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-line-soft bg-surface-raised p-5 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-sm font-semibold text-ink">Create Sample</h2>
            <div className="space-y-3">
              <Field label="Nama">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama item..."
                  autoFocus
                />
              </Field>
              <Field label="Deskripsi">
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi..."
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Quantity">
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                  />
                </Field>
                <Field label="Harga">
                  <Input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </Field>
              </div>
            </div>
            {error && (
              <div className="mt-3">
                <ErrorNotice message={error} />
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button onClick={onCreate} disabled={saving || !name.trim()}>
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mode kecil (padanan #small-table col-md-5 + col-md-7 small-table-right-col) */}
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className={cx("min-w-0", smallTable ? "lg:w-5/12" : "lg:w-full")}>
          <Card>
            <h2 className="mb-4 text-sm font-semibold text-ink">
              Daftar Item ({items.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line-soft text-left text-xs uppercase tracking-wider text-ink-faint">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Nama</th>
                    {!smallTable && <th className="px-3 py-2">Deskripsi</th>}
                    <th className="px-3 py-2">Qty</th>
                    {!smallTable && <th className="px-3 py-2">Harga</th>}
                    {!smallTable && <th className="px-3 py-2">Dibuat</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-ink-muted">
                        Belum ada item.
                      </td>
                    </tr>
                  ) : (
                    items.map((it) => (
                      <tr
                        key={it.id}
                        onClick={() => selectItem(it.id)}
                        className={cx(
                          "cursor-pointer transition-colors",
                          selectedId === it.id
                            ? "bg-accent-soft"
                            : "hover:bg-surface-overlay"
                        )}
                      >
                        <td className="px-3 py-2 text-ink-faint">#{it.id}</td>
                        <td className="px-3 py-2 font-medium text-ink">{it.name}</td>
                        {!smallTable && (
                          <td className="max-w-[200px] truncate px-3 py-2 text-ink-muted">
                            {it.description ?? "—"}
                          </td>
                        )}
                        <td className="px-3 py-2 text-ink-muted">{it.quantity ?? 0}</td>
                        {!smallTable && (
                          <td className="px-3 py-2 text-ink-muted">
                            {it.price ? Number(it.price).toLocaleString("id-ID") : "0"}
                          </td>
                        )}
                        {!smallTable && (
                          <td className="px-3 py-2 text-ink-muted">
                            {it.created_at ? new Date(it.created_at).toLocaleDateString() : "—"}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {selected && (
          <div className="min-w-0 flex-1 lg:w-7/12">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink">
                  #{selected.id} {selected.name}
                </h2>
              </div>

              {sortedTabs.length > 0 && (
                <nav className="mb-4 flex flex-wrap gap-1 border-b border-line-soft pb-2">
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

              {tab ? (
                <TabContent
                  url={tab.api.replace("{id}", String(selected.id))}
                  emptyText="Tidak ada data."
                />
              ) : null}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

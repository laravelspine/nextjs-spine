"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button, Card, ErrorNotice, Field, Input, PageHeader } from "@/lib/ui";
import { SmallTable, type SmallTableColumn } from "@/lib/small-table";
import { useModuleExtensions } from "@/lib/module-extensions";
import { usePaginationLimit } from "@/lib/use-pagination-limit";

interface SampleItem {
  id: number;
  name: string;
  description?: string | null;
  quantity?: number;
  price?: string | number;
  status?: string;
  created_at?: string;
}

const columns: SmallTableColumn<SampleItem>[] = [
  {
    key: "id",
    label: "ID",
    primary: true,
    render: (it) => <span className="text-ink-faint">#{it.id}</span>,
  },
  {
    key: "name",
    label: "Nama",
    primary: true,
    render: (it) => <span className="font-medium text-ink">{it.name}</span>,
  },
  {
    key: "description",
    label: "Deskripsi",
    render: (it) => (
      <span className="max-w-[200px] truncate text-ink-muted">{it.description ?? "—"}</span>
    ),
  },
  {
    key: "quantity",
    label: "Qty",
    primary: true,
    render: (it) => <span className="text-ink-muted">{it.quantity ?? 0}</span>,
  },
  {
    key: "price",
    label: "Harga",
    render: (it) => (
      <span className="text-ink-muted">
        {it.price ? Number(it.price).toLocaleString("id-ID") : "0"}
      </span>
    ),
  },
  {
    key: "created_at",
    label: "Dibuat",
    render: (it) => (
      <span className="text-ink-muted">
        {it.created_at ? new Date(it.created_at).toLocaleDateString() : "—"}
      </span>
    ),
  },
];

export default function SamplePage() {
  const [items, setItems] = useState<SampleItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<SampleItem | null>(null); // record yang di-Edit
  const [smallView, setSmallView] = useState(true); // toggle small view ON/OFF
  const [refreshKey, setRefreshKey] = useState(0); // paksa refetch konten tab setelah edit
  const { detail_tabs } = useModuleExtensions();
  const tabs = detail_tabs["sample"] ?? [];
  const perPage = usePaginationLimit(); // setting tables_pagination_limit

  // Hash #id (padanan do_hash_helper): pilih record dari URL saat load.
  useEffect(() => {
    const h = Number(window.location.hash.replace("#", ""));
    if (h) setSelectedId(h);
  }, []);

  const load = useCallback(() => {
    api<{ data: SampleItem[] }>("/api/v1/sample").then((res) => {
      if (res.ok) {
        setItems(res.data?.data ?? []);
      }
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Pilih item: update state + URL hash (#id) — padanan do_hash_helper legacy,
  // hash HANYA saat klik baris, bukan saat load halaman.
  function selectItem(id: number | string) {
    const n = Number(id);
    setSelectedId(n);
    window.location.hash = String(n);
  }

  async function onSave() {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        quantity: quantity === "" ? 0 : Number(quantity),
        price: price === "" ? 0 : Number(price),
      };
      const url = editing
        ? `/api/v1/sample/${editing.id}`
        : "/api/v1/sample";
      const res = await api(url, {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError(res.error ?? "Gagal menyimpan");
        return;
      }
      setName("");
      setDescription("");
      setQuantity("");
      setPrice("");
      const savedId = (res.data as SampleItem).id;
      setOpen(false);
      setEditing(null);
      await load();
      // Setelah create/edit: pilih record → panel kanan muncul + konten tab
      // di-refetch (data hasil edit langsung tampil, tanpa klik row ulang).
      setSelectedId(savedId);
      window.location.hash = String(savedId);
      setRefreshKey((k) => k + 1);
    } catch {
      setError("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  // Edit record aktif (padanan tombol Edit quotations) — isi form dari record.
  function openEdit(item: SampleItem) {
    setName(item.name);
    setDescription(item.description ?? "");
    setQuantity(item.quantity != null ? String(item.quantity) : "");
    setPrice(item.price != null ? String(item.price) : "");
    setError(null);
    setEditing(item);
    setOpen(true);
  }

  // PDF record aktif — buka endpoint pdf/from-html core dengan data item.
  function onPdf(item: SampleItem) {
    const html = encodeURIComponent(
      `<h1>Sample #${item.id} — ${item.name}</h1><p>${item.description ?? ""}</p>` +
        `<p>Qty: ${item.quantity ?? 0} | Harga: ${item.price ?? 0}</p>`
    );
    window.open(`/api/v1/pdf/from-html?html=${html}`, "_blank");
  }

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
          onClick={() => {
            setOpen(false);
            setEditing(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-line-soft bg-surface-raised p-5 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-sm font-semibold text-ink">
              {editing ? `Edit Sample #${editing.id}` : "Create Sample"}
            </h2>
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
              <Button
                variant="secondary"
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                }}
              >
                Batal
              </Button>
              <Button onClick={onSave} disabled={saving || !name.trim()}>
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <SmallTable
        items={items}
        tabs={tabs}
        columns={columns}
        selectedId={selectedId}
        onSelectId={(id) => {
          selectItem(id);
          setSmallView(true); // klik baris → auto ON (padanan load_small_table_item auto-toggle)
        }}
        getItemId={(it) => it.id}
        showDetail={smallView}
        refreshKey={refreshKey}
        perPage={perPage}
        getSearchText={(it) => `${it.name} ${it.description ?? ""}`}
        tabHideKeys={["ulid", "name"]}
        renderHeader={(it) => (
          <span className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {it.status}
            </span>
            <span>#{it.id}</span>
            <span className="text-ink">{it.name}</span>
          </span>
        )}
        toolbar={(item) => (
          <>
            <Button variant="secondary" onClick={() => openEdit(item)}>
              Edit
            </Button>
            <Button variant="secondary" onClick={() => onPdf(item)}>
              PDF
            </Button>
            <Button
              variant="secondary"
              onClick={() => setSmallView((v) => !v)}
              title="Toggle small view"
            >
              {smallView ? "◀" : "▶"}
            </Button>
          </>
        )}
      />
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button, Card, ErrorNotice, Field, Input, PageHeader } from "@/lib/ui";
import { SmallTable, type SmallTableColumn } from "@/lib/small-table";
import { useModuleExtensions } from "@/lib/module-extensions";

interface SampleItem {
  id: number;
  name: string;
  description?: string | null;
  quantity?: number;
  price?: string | number;
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
  const { detail_tabs } = useModuleExtensions();
  const tabs = detail_tabs["sample"] ?? [];

  // Hash #id (padanan do_hash_helper): pilih record dari URL saat load.
  useEffect(() => {
    const h = Number(window.location.hash.replace("#", ""));
    if (h) setSelectedId(h);
  }, []);

  const load = useCallback(() => {
    api<{ data: SampleItem[] }>("/api/v1/sample").then((res) => {
      if (res.ok) {
        const d = res.data?.data ?? [];
        setItems(d);
        if (d.length > 0 && selectedId === null) {
          setSelectedId(d[0].id);
        }
      }
    });
  }, [selectedId]);

  useEffect(() => {
    load();
  }, [load]);

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
      // load_small_table_item auto-toggle setelah create).
      setSelectedId(created);
    } catch {
      setError("Gagal membuat");
    } finally {
      setSaving(false);
    }
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

      <SmallTable
        items={items}
        tabs={tabs}
        columns={columns}
        selectedId={selectedId}
        onSelectId={(id) => setSelectedId(Number(id))}
        getItemId={(it) => it.id}
      />
    </div>
  );
}

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
  created_at?: string;
}

export default function SamplePage() {
  const [items, setItems] = useState<SampleItem[]>([]);
  const [selected, setSelected] = useState<SampleItem | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { detail_tabs } = useModuleExtensions();
  const tabs: DetailTab[] = detail_tabs["sample"] ?? [];

  const load = useCallback(() => {
    api<{ data: SampleItem[] }>("/api/v1/sample").then((res) => {
      if (res.ok) {
        const d = res.data?.data ?? [];
        setItems(d);
        if (d.length > 0) {
          setSelected(d[0]);
          setActiveTab(tabs[0]?.slug ?? "");
        }
      }
    });
  }, [tabs]);

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
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        setError(res.error ?? "Gagal membuat");
        return;
      }
      setName("");
      setOpen(false);
      load();
    } catch {
      setError("Gagal membuat");
    } finally {
      setSaving(false);
    }
  }

  const sortedTabs = [...tabs].sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
  const tab = sortedTabs.find((t) => t.slug === activeTab) ?? sortedTabs[0] ?? null;

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
            <Field label="Nama">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama item..."
                autoFocus
              />
            </Field>
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
                <th className="px-3 py-2">Dibuat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-ink-muted">
                    Belum ada item.
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr
                    key={it.id}
                    onClick={() => {
                      setSelected(it);
                      setActiveTab(sortedTabs[0]?.slug ?? "");
                    }}
                    className={cx(
                      "cursor-pointer transition-colors",
                      selected?.id === it.id
                        ? "bg-accent-soft"
                        : "hover:bg-surface-overlay"
                    )}
                  >
                    <td className="px-3 py-2 text-ink-faint">#{it.id}</td>
                    <td className="px-3 py-2 font-medium text-ink">{it.name}</td>
                    <td className="px-3 py-2 text-ink-muted">
                      {it.created_at ? new Date(it.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
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
      )}
    </div>
  );
}

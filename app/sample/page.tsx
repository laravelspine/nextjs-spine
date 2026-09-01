"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button, Card, ErrorNotice, Field, Input, PageHeader } from "@/lib/ui";

interface SampleItem {
  id: number;
  name: string;
}

export default function SamplePage() {
  const [items, setItems] = useState<SampleItem[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api<{ data: SampleItem[] }>("/api/v1/sample").then((res) => {
      if (res.ok) setItems(res.data?.data ?? []);
    });
  }, []);

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
      load();
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
        desc="Halaman dari modul Sample — data via GET/POST /api/v1/sample."
      />

      {error && <ErrorNotice message={error} />}

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-ink">Buat Item Baru</h2>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama item..."
            />
          </div>
          <Button onClick={onCreate} disabled={saving || !name.trim()}>
            {saving ? "Menyimpan..." : "Tambah"}
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-sm font-semibold text-ink">Daftar Item ({items.length})</h2>
        {items.length === 0 ? (
          <p className="text-sm text-ink-muted">Belum ada item. Tambahkan di atas.</p>
        ) : (
          <ul className="divide-y divide-line-soft">
            {items.map((it) => (
              <li key={it.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-ink">{it.name}</span>
                <span className="text-xs text-ink-faint">#{it.id}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

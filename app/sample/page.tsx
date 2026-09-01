"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button, Card, ErrorNotice, Field, Input, PageHeader } from "@/lib/ui";
import { MasterDetail } from "@/lib/master-detail";
import { useModuleExtensions } from "@/lib/module-extensions";

interface SampleItem {
  id: number;
  name: string;
}

export default function SamplePage() {
  const [items, setItems] = useState<SampleItem[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { detail_tabs } = useModuleExtensions();
  const tabs = detail_tabs["sample"] ?? [];

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
        desc="Halaman dari modul Sample — list kiri + panel detail bertab (helper MasterDetail)."
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

      <MasterDetail items={items} tabs={tabs} />
    </div>
  );
}

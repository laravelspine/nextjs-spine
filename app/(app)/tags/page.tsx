"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button, Card, EmptyState, ErrorNotice, Input, PageHeader } from "@/lib/ui";

interface Tag {
  id: number;
  name: string;
  [k: string]: unknown;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setError(null);
    const res = await api<Tag[]>("/api/v1/tags");
    if (!res.ok) {
      setError(res.error ?? "Gagal memuat");
      return;
    }
    setTags(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await api("/api/v1/tags", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      setError(res.error ?? "Gagal buat");
      return;
    }
    setName("");
    load();
  }

  async function onDelete(id: number) {
    const res = await api(`/api/v1/tags/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError(res.error ?? "Gagal hapus");
      return;
    }
    load();
  }

  if (loading) return <p className="text-ink-muted">Memuat...</p>;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader title="Tags" desc="CRUD /api/v1/tags — contoh resource sederhana." />

      <Card>
        <form onSubmit={onCreate} className="flex gap-3">
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama tag"
          />
          <Button type="submit">Tambah</Button>
        </form>
      </Card>

      {error && <ErrorNotice message={error} />}

      {tags.length === 0 ? (
        <EmptyState message="Belum ada tag." />
      ) : (
        <ul className="divide-y divide-line-soft rounded-xl border border-line-soft bg-surface-raised">
          {tags.map((tag) => (
            <li key={tag.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-ink">{tag.name}</span>
              <button
                onClick={() => onDelete(tag.id)}
                className="text-sm text-danger hover:underline"
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

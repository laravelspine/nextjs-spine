"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

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

  if (loading) return <p className="text-zinc-500">Memuat...</p>;

  return (
    <div className="mx-auto max-w-md space-y-6 pt-8">
      <header>
        <h1 className="text-2xl font-bold">Tags</h1>
        <p className="mt-1 text-sm text-zinc-500">
          CRUD /api/v1/tags — contoh resource sederhana.
        </p>
      </header>

      <form onSubmit={onCreate} className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          placeholder="Nama tag"
        />
        <button
          type="submit"
          className="rounded-md bg-emerald-500 px-4 py-2 font-medium text-zinc-950 hover:bg-emerald-400"
        >
          Tambah
        </button>
      </form>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {tags.length === 0 ? (
        <p className="text-zinc-500">Belum ada tag.</p>
      ) : (
        <ul className="divide-y divide-zinc-800 rounded-lg border border-zinc-800">
          {tags.map((tag) => (
            <li key={tag.id} className="flex items-center justify-between px-4 py-3">
              <span>{tag.name}</span>
              <button
                onClick={() => onDelete(tag.id)}
                className="text-sm text-red-400 hover:underline"
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

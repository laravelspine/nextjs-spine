"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function MetaPage() {
  const [type, setType] = useState("user");
  const [id, setId] = useState("1");
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const base = `/api/v1/meta/${type}/${id}`;

  async function onList(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await api<unknown>(base);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Gagal");
      setResult(null);
      return;
    }
    setResult(JSON.stringify(res.data, null, 2));
  }

  async function onSet(e: React.FormEvent) {
    e.preventDefault();
    if (!key) return;
    setError(null);
    const res = await api(base, {
      method: "POST",
      body: JSON.stringify({ meta: { [key]: value } }),
    });
    if (!res.ok) setError(res.error ?? "Gagal set");
    else {
      setResult(JSON.stringify(res.data, null, 2));
      setKey("");
      setValue("");
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 pt-8">
      <header>
        <h1 className="text-2xl font-bold">Meta</h1>
        <p className="mt-1 text-sm text-zinc-500">
          CRUD /api/v1/meta/{"{type}"}/{"{id}"}/{"{key}"} — data kunci-nilai per entity.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Tipe</label>
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium">ID</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onList}
          disabled={loading}
          className="flex-1 rounded-md bg-zinc-800 py-2 font-medium hover:bg-zinc-700 disabled:opacity-50"
        >
          Ambil semua meta
        </button>
      </div>

      <form onSubmit={onSet} className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Key</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Value</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-emerald-500 py-2 font-medium text-zinc-950 hover:bg-emerald-400"
        >
          Set meta
        </button>
      </form>

      {result && (
        <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-xs text-zinc-300">
          {result}
        </pre>
      )}
      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface SettingValue {
  value?: unknown;
  [k: string]: unknown;
}

export default function SettingsPage() {
  const [key, setKey] = useState("dateformat");
  const [value, setValue] = useState("");
  const [current, setCurrent] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onGet(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await api<SettingValue>(`/api/v1/settings/${key}`);
    setLoading(false);

    if (!res.ok) {
      setError(res.error ?? "Gagal ambil");
      setCurrent(null);
      return;
    }
    const v = res.data.value ?? res.data[key];
    setCurrent(typeof v === "string" ? v : JSON.stringify(v));
    setValue(String(v ?? ""));
  }

  async function onSave() {
    setError(null);
    const res = await api(`/api/v1/settings/${key}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    });
    setMessage(res.ok ? `Tersimpan: ${key}` : null);
    if (!res.ok) setError(res.error ?? "Gagal simpan");
  }

  return (
    <div className="mx-auto max-w-md space-y-6 pt-8">
      <header>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          GET/PUT /api/v1/settings/{"{key}"} — contoh CRUD sederhana.
        </p>
      </header>

      <form onSubmit={onGet} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Key setting</label>
          <input
            type="text"
            required
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            placeholder="dateformat"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-zinc-800 py-2 font-medium hover:bg-zinc-700 disabled:opacity-50"
        >
          {loading ? "Mengambil..." : "Ambil setting"}
        </button>
      </form>

      {current !== null && (
        <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <label className="text-sm font-medium">
            Nilai <code className="text-emerald-400">{key}</code>
          </label>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm outline-none focus:border-emerald-500"
          />
          <button
            onClick={onSave}
            className="w-full rounded-md bg-emerald-500 py-2 font-medium text-zinc-950 hover:bg-emerald-400"
          >
            Simpan
          </button>
        </div>
      )}

      {message && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}

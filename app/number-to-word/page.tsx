"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface ConvertResult {
  words?: string;
  result?: string;
  [k: string]: unknown;
}

export default function NumberToWordPage() {
  const [number, setNumber] = useState("1234.56");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await api<ConvertResult>("/api/v1/number-to-word/convert", {
      method: "POST",
      body: JSON.stringify({ number: Number(number) }),
    });

    setLoading(false);

    if (!res.ok) {
      setError(res.error ?? "Gagal konversi");
      return;
    }
    setResult(String(res.data.words ?? res.data.result ?? JSON.stringify(res.data)));
  }

  return (
    <div className="mx-auto max-w-md space-y-6 pt-8">
      <header>
        <h1 className="text-2xl font-bold">Number to Word</h1>
        <p className="mt-1 text-sm text-zinc-500">
          POST /api/v1/number-to-word/convert — contoh tool backend.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Angka</label>
          <input
            type="number"
            step="any"
            required
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-emerald-500 py-2 font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? "Mengonversi..." : "Konversi"}
        </button>
      </form>

      {result && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-lg">
          {result}
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

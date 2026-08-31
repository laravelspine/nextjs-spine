"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface QrResult {
  data_uri?: string;
  qr_code?: string;
  [k: string]: unknown;
}

export default function QrCodePage() {
  const [content, setContent] = useState("https://example.com");
  const [size, setSize] = useState(200);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await api<QrResult>("/api/v1/qr-code/generate", {
      method: "POST",
      body: JSON.stringify({ content, size }),
    });

    setLoading(false);

    if (!res.ok) {
      setError(res.error ?? "Gagal generate");
      return;
    }

    const uri = res.data.data_uri ?? res.data.qr_code ?? null;
    setResult(uri);
  }

  return (
    <div className="mx-auto max-w-md space-y-6 pt-8">
      <header>
        <h1 className="text-2xl font-bold">QR Code</h1>
        <p className="mt-1 text-sm text-zinc-500">
          POST /api/v1/qr-code/generate — contoh tool backend.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Konten</label>
          <input
            type="text"
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Ukuran (px)</label>
          <input
            type="number"
            min={50}
            max={1000}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        {error && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-emerald-500 py-2 font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? "Generate..." : "Generate QR"}
        </button>
      </form>

      {result && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-800 bg-white p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result} alt="QR Code" width={size} height={size} />
          <a
            href={result}
            download="qr-code.png"
            className="text-sm text-emerald-400 hover:underline"
          >
            Unduh PNG
          </a>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { api, getToken } from "@/lib/api";

export default function PdfPage() {
  const [html, setHtml] = useState("<h1>Invoice Demo</h1><p>Halo dari Spine.</p>");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await api<{ data?: string }>("/api/v1/pdf/from-html", {
      method: "POST",
      body: JSON.stringify({ html }),
    });

    setLoading(false);

    if (!res.ok) {
      setError(res.error ?? "Gagal render PDF");
      return;
    }

    const b64 = res.data?.data;
    if (!b64) {
      setError("Response tidak berisi PDF");
      return;
    }

    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "application/pdf" });
    setPdfUrl(URL.createObjectURL(blob));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-8">
      <header>
        <h1 className="text-2xl font-bold">PDF dari HTML</h1>
        <p className="mt-1 text-sm text-zinc-500">
          POST /api/v1/pdf/from-html — contoh render + download (event PdfCreating/PdfCreated).
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">HTML</label>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={8}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-emerald-500 py-2 font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? "Render..." : "Render PDF"}
        </button>
      </form>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {pdfUrl && (
        <div className="space-y-3">
          <a
            href={pdfUrl}
            download="spine-demo.pdf"
            className="inline-block rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700"
          >
            Unduh PDF
          </a>
          <iframe src={pdfUrl} className="h-96 w-full rounded-lg border border-zinc-800" />
        </div>
      )}
    </div>
  );
}

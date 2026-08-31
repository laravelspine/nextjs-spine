"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button, Card, ErrorNotice, Field, PageHeader, Textarea } from "@/lib/ui";

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
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="PDF dari HTML"
        desc="POST /api/v1/pdf/from-html — contoh render + download (event PdfCreating/PdfCreated)."
      />

      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="HTML">
            <Textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              rows={8}
              className="font-mono"
            />
          </Field>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Render..." : "Render PDF"}
          </Button>
        </form>
      </Card>

      {error && <ErrorNotice message={error} />}

      {pdfUrl && (
        <div className="space-y-3">
          <a
            href={pdfUrl}
            download="spine-demo.pdf"
            className="inline-block rounded-md bg-surface-overlay px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-line"
          >
            Unduh PDF
          </a>
          <iframe
            src={pdfUrl}
            className="h-96 w-full rounded-xl border border-line-soft"
          />
        </div>
      )}
    </div>
  );
}

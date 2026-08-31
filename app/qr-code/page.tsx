"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button, Card, ErrorNotice, Field, Input, PageHeader } from "@/lib/ui";

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
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader title="QR Code" desc="POST /api/v1/qr-code/generate — contoh tool backend." />

      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Konten">
            <Input
              type="text"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </Field>
          <Field label="Ukuran (px)">
            <Input
              type="number"
              min={50}
              max={1000}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </Field>

          {error && <ErrorNotice message={error} />}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Generate..." : "Generate QR"}
          </Button>
        </form>
      </Card>

      {result && (
        <Card className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result} alt="QR Code" width={size} height={size} />
          <a
            href={result}
            download="qr-code.png"
            className="text-sm text-accent-strong hover:underline"
          >
            Unduh PNG
          </a>
        </Card>
      )}
    </div>
  );
}

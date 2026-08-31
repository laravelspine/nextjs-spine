"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button, Card, ErrorNotice, Field, Input, PageHeader } from "@/lib/ui";

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
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader
        title="Number to Word"
        desc="POST /api/v1/number-to-word/convert — contoh tool backend."
      />

      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Angka">
            <Input
              type="number"
              step="any"
              required
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </Field>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Mengonversi..." : "Konversi"}
          </Button>
        </form>
      </Card>

      {result && <Card className="text-lg">{result}</Card>}
      {error && <ErrorNotice message={error} />}
    </div>
  );
}

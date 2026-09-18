"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button, Card, ErrorNotice, Field, Input, PageHeader } from "@/lib/ui";

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
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        title="Meta"
        desc='CRUD /api/v1/meta/{"type"}/{"id"}/{"key"} — data kunci-nilai per entity.'
      />

      <Card>
        <form onSubmit={onList} className="grid grid-cols-2 gap-3">
          <Field label="Tipe">
            <Input type="text" value={type} onChange={(e) => setType(e.target.value)} />
          </Field>
          <Field label="ID">
            <Input type="text" value={id} onChange={(e) => setId(e.target.value)} />
          </Field>
          <div className="col-span-2">
            <Button type="submit" variant="secondary" disabled={loading} className="w-full">
              {loading ? "Mengambil..." : "Ambil semua meta"}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Set meta">
        <form onSubmit={onSet} className="grid grid-cols-2 gap-3">
          <Field label="Key">
            <Input type="text" value={key} onChange={(e) => setKey(e.target.value)} />
          </Field>
          <Field label="Value">
            <Input type="text" value={value} onChange={(e) => setValue(e.target.value)} />
          </Field>
          <div className="col-span-2">
            <Button type="submit" className="w-full">
              Set meta
            </Button>
          </div>
        </form>
      </Card>

      {result && (
        <pre className="overflow-x-auto rounded-xl border border-line-soft bg-surface-raised p-4 text-xs text-ink">
          {result}
        </pre>
      )}
      {error && <ErrorNotice message={error} />}
    </div>
  );
}

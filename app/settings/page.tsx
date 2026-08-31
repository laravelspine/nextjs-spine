"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button, Card, ErrorNotice, Field, Input, PageHeader } from "@/lib/ui";

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
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader
        title="Settings"
        desc='GET/PUT /api/v1/settings/{"key"} — contoh CRUD sederhana.'
      />

      <Card>
        <form onSubmit={onGet} className="space-y-4">
          <Field label="Key setting">
            <Input
              type="text"
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="dateformat"
            />
          </Field>
          <Button type="submit" variant="secondary" disabled={loading} className="w-full">
            {loading ? "Mengambil..." : "Ambil setting"}
          </Button>
        </form>
      </Card>

      {current !== null && (
        <Card>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-ink">
              Nilai <code className="text-accent-strong">{key}</code>
            </label>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-line bg-surface-raised px-3 py-2 font-mono text-sm text-ink outline-none focus:border-accent"
            />
            <Button onClick={onSave} className="w-full">
              Simpan
            </Button>
          </div>
        </Card>
      )}

      {message && (
        <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          {message}
        </div>
      )}
      {error && <ErrorNotice message={error} />}
    </div>
  );
}

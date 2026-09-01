"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button, Card, ErrorNotice, Field, Input, PageHeader } from "@/lib/ui";

/** Field aksi (tombol) — memanggil endpoint dari kontrak action. */
function ActionField({
  field,
  values,
  onResult,
}: {
  field: SettingsField;
  values: Record<string, string>;
  onResult: (msg: string, ok: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const action = field.action;
  if (!action) return null;
  const { method, path, from_key, body_key } = action;

  async function run() {
    setBusy(true);
    try {
      const body: Record<string, string> = {};
      if (from_key && body_key) {
        body[body_key] = values[from_key] ?? "";
      }
      const res = await api(path, {
        method,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        onResult(res.error ?? "Gagal", false);
      } else {
        onResult("Berhasil", true);
      }
    } catch {
      onResult("Gagal", false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={run} disabled={busy} variant="secondary">
      {busy ? "Mengirim..." : field.label}
    </Button>
  );
}

interface SettingsField {
  key: string;
  label: string;
  type: string;
  options?: { value: string; label: string }[];
  default?: string;
  action?: {
    method: string;
    path: string;
    from_key?: string;
    body_key?: string;
  };
}

interface SettingsTab {
  slug: string;
  label: string;
  icon?: string;
  position?: number;
  fields: SettingsField[];
}

export default function SettingsPage() {
  const [tabs, setTabs] = useState<SettingsTab[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api<{ tabs: SettingsTab[] }>("/api/v1/settings/schema")
      .then((res) => {
        if (!res.ok) {
          setError(res.error ?? "Gagal memuat schema");
          return;
        }
        const list = res.data.tabs ?? [];
        setTabs(list);
        if (list.length > 0 && active === null) {
          setActive(list[0].slug);
        }
      })
      .catch(() => setError("Gagal memuat schema"));
  }, [active]);

  const tab = tabs.find((t) => t.slug === active);

  const loadValues = useCallback(
    (t: SettingsTab | undefined) => {
      if (!t) return;
      const keys = t.fields.map((f) => f.key);
      const next: Record<string, string> = {};
      t.fields.forEach((f) => {
        next[f.key] = f.default ?? "";
      });
      setValues(next);
      setSaved(false);

      // Isi nilai aktual — satu request bulk GETTER
      api<{ data: Record<string, string | null> }>("/api/v1/settings/bulk", {
        method: "POST",
        body: JSON.stringify({ keys }),
      }).then((res) => {
        if (!res.ok || !res.data?.data) return;
        setValues((v) => {
          const merged = { ...v };
          for (const k of keys) {
            const val = res.data.data[k];
            if (val !== undefined && val !== null) merged[k] = String(val);
          }
          return merged;
        });
      });
    },
    []
  );

  useEffect(() => {
    loadValues(tab);
  }, [tab, loadValues]);

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      // PUT per key (bulk hanya GETTER; tidak ada bulk-setter di API)
      for (const f of tab?.fields ?? []) {
        const res = await api(`/api/v1/settings/${f.key}`, {
          method: "PUT",
          body: JSON.stringify({ value: values[f.key] ?? "" }),
        });
        if (!res.ok) {
          setError(res.error ?? `Gagal menyimpan ${f.key}`);
          return;
        }
      }
      setSaved(true);
    } catch {
      setError("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" desc="Tab & field dari manifest modul aktif (schema API)." />

      {error && <ErrorNotice message={error} />}

      {tabs.length === 0 && !error && (
        <Card>
          <p className="text-sm text-ink-muted">
            Tidak ada tab settings dari modul aktif.
          </p>
        </Card>
      )}

      {tab && (
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Tab nav (kiri) — pola NextAdmin profile */}
          <nav className="flex w-full shrink-0 gap-2 lg:w-64 lg:flex-col">
            {tabs.map((t) => {
              const isActive = t.slug === active;
              return (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => setActive(t.slug)}
                  className={
                    "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors " +
                    (isActive
                      ? "border-accent/40 bg-accent-soft/40 text-ink"
                      : "border-line-soft bg-surface-raised text-ink-muted hover:text-ink")
                  }
                >
                  {t.icon && <span className="text-base">{t.icon}</span>}
                  {t.label}
                </button>
              );
            })}
          </nav>

          {/* Form (kanan) — pola NextAdmin account */}
          <div className="min-w-0 flex-1">
            <Card>
              <h2 className="mb-5 text-lg font-semibold text-ink">{tab.label}</h2>
              <div className="space-y-4">
                {tab.fields.map((f) => (
                  <Field key={f.key} label={f.label}>
                    {f.type === "checkbox" ? (
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={values[f.key] === "1"}
                          onChange={(e) =>
                            setValues((v) => ({ ...v, [f.key]: e.target.checked ? "1" : "0" }))
                          }
                          className="h-4 w-4 accent-[var(--accent)]"
                        />
                        <span className="text-sm text-ink-muted">{f.label}</span>
                      </label>
                    ) : f.type === "select" ? (
                      <select
                        value={values[f.key] ?? ""}
                        onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                        className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                      >
                        {(f.options ?? []).map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : f.type === "action" ? (
                      <ActionField
                        field={f}
                        values={values}
                        onResult={(msg, ok) => {
                          setError(ok ? null : msg);
                          setSaved(ok);
                          if (ok) setTimeout(() => setSaved(false), 3000);
                        }}
                      />
                    ) : (
                      <Input
                        type={f.type === "number" ? "number" : f.type === "password" ? "password" : "text"}
                        value={values[f.key] ?? ""}
                        onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                      />
                    )}
                  </Field>
                ))}

                <div className="flex items-center gap-3 pt-2">
                  <Button onClick={onSave} disabled={saving}>
                    {saving ? "Menyimpan..." : "Simpan"}
                  </Button>
                  {saved && <span className="text-sm text-success">Tersimpan ✓</span>}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

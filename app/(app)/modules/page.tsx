"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorNotice,
  Field,
  Input,
  PageHeader,
} from "@/lib/ui";

interface SpineModule {
  id: string;
  name: string;
  description?: string;
  priority?: string;
  enabled: boolean;
  installed: boolean;
}

export default function ModulesPage() {
  const [modules, setModules] = useState<SpineModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function load() {
    setError(null);
    const res = await api<{ data?: Record<string, unknown> }>("/api/v1/modules");
    if (!res.ok) {
      setError(res.error ?? "Gagal memuat modul");
      setModules([]);
      setLoading(false);
      return;
    }
    const payload = res.data?.data;
    const arr: SpineModule[] = [];
    if (payload && typeof payload === "object") {
      for (const [key, raw] of Object.entries(payload)) {
        const v = raw as Record<string, unknown>;
        arr.push({
          id: key,
          name: (v.studly as string) ?? (v.name as string) ?? key,
          description: (v.description as string) ?? undefined,
          priority: (v.priority as string) ?? undefined,
          enabled: Boolean(v.enabled),
          installed: Boolean(v.installed),
        });
      }
      arr.sort((a, b) => a.name.localeCompare(b.name));
    }
    setModules(arr);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setEnabled(mod: SpineModule, enabled: boolean) {
    setBusyId(mod.id);
    setError(null);
    const res = await api(`/api/v1/modules/${mod.id}/${enabled ? "enable" : "disable"}`, {
      method: "POST",
    });
    if (!res.ok) {
      setError(res.error ?? "Gagal ubah status modul");
      setBusyId(null);
      return;
    }
    setBusyId(null);
    load();
  }

  async function onUninstall(mod: SpineModule) {
    if (!confirm(`Uninstall modul "${mod.name}"? File di disk akan dihapus.`)) return;
    setBusyId(mod.id);
    setError(null);
    const res = await api(`/api/v1/modules/${mod.id}/uninstall?purge=1`, { method: "POST" });
    if (!res.ok) {
      setError(res.error ?? "Gagal uninstall modul");
      setBusyId(null);
      return;
    }
    setBusyId(null);
    load();
  }

  async function onInstall(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInput.current?.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    setBusyId(null);
    setError(null);
    const res = await api("/api/v1/modules/install", { method: "POST", body });
    if (!res.ok) {
      setError(res.error ?? "Gagal install modul");
      return;
    }
    if (fileInput.current) fileInput.current.value = "";
    load();
  }

  if (loading) return <p className="text-ink-muted">Memuat...</p>;

  return (
    <div className="page mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Modul"
        desc="Operasi modul → hooks: install → ModuleInstalled, enable → ModuleActivated, disable → ModuleDeactivated, uninstall → ModuleUninstalled."
      />

      <Card className="module-install" title="Instal modul (zip ↔ ModuleInstalled)">
        <form onSubmit={onInstall} className="module-install__form flex items-end gap-3">
          <Field label="File modul (.zip)">
            <Input type="file" accept=".zip,application/zip" ref={fileInput} />
          </Field>
          <Button type="submit">Install</Button>
        </form>
      </Card>

      {error && <ErrorNotice message={error} />}

      {modules.length === 0 ? (
        <EmptyState message="Belum ada modul terpasang." />
      ) : (
        <ul className="module-list space-y-3">
          {modules.map((mod) => (
            <li key={mod.id} className="module-item">
              <Card>
                <div className="module-item__header flex items-start justify-between gap-4">
                  <div className="module-item__title flex items-center gap-2">
                    <h3 className="module-item__name text-sm font-semibold text-ink">
                      {mod.name}
                    </h3>
                    <Badge tone={mod.enabled ? "success" : "neutral"}>
                      {mod.enabled ? "Aktif" : "Nonaktif"}
                    </Badge>
                    {mod.installed && <Badge tone="info">Terpasang</Badge>}
                  </div>
                  <div className="module-item__actions flex shrink-0 items-center gap-2">
                    {mod.installed &&
                      (mod.enabled ? (
                        <Button
                          variant="secondary"
                          onClick={() => setEnabled(mod, false)}
                          disabled={busyId === mod.id}
                        >
                          Nonaktifkan
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setEnabled(mod, true)}
                          disabled={busyId === mod.id}
                        >
                          Aktifkan
                        </Button>
                      ))}
                    <Button
                      variant="danger"
                      onClick={() => onUninstall(mod)}
                      disabled={!mod.installed || busyId === mod.id}
                    >
                      Uninstall
                    </Button>
                  </div>
                </div>
                {mod.description && (
                  <div className="module-item__description">
                    <p className="mt-3 text-sm text-ink-muted">{mod.description}</p>
                  </div>
                )}
                <div className="module-item__meta">
                  <p className="mt-1 text-xs text-ink-faint">id: {mod.id}</p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
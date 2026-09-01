"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/lib/ui";
import { useModuleExtensions, type ModuleWidget } from "@/lib/module-extensions";

/**
 * ModuleWidgetPanel — render semua widget modul dari registry.
 * Widget = {id, area, title, api}: konten di-fetch dari widget.api,
 * area menentukan penempatan (right-4 = kolom kanan dashboard).
 */
function ModuleWidgetCard({ widget }: { widget: ModuleWidget }) {
  const [rows, setRows] = useState<unknown[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ data?: unknown[] }>(widget.api)
      .then((res) => {
        if (res.ok) {
          const d = res.data?.data;
          setRows(Array.isArray(d) ? d : d ? [d] : []);
        } else {
          setError(res.error ?? "Gagal");
        }
      })
      .catch(() => setError("Gagal"));
  }, [widget.api]);

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-ink">{widget.title}</h3>
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-ink-muted">Tidak ada data.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r, i) => {
            const obj = r as Record<string, unknown>;
            const name = obj.name ?? obj.title ?? obj.label ?? JSON.stringify(obj);
            return (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-ink">{String(name)}</span>
                {obj.id !== undefined && (
                  <span className="text-xs text-ink-faint">#{String(obj.id)}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

export function ModuleWidgets() {
  const { widgets } = useModuleExtensions();

  if (widgets.length === 0) return null;

  return (
    <div className="space-y-4">
      {widgets.map((w) => (
        <ModuleWidgetCard key={w.id} widget={w} />
      ))}
    </div>
  );
}

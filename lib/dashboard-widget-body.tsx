"use client";

import type { ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, getToken } from "./api";
import type { ModuleWidget } from "./module-extensions";

/**
 * Registry widget DASHBOARD — infrastruktur.
 *
 * Modul bisnis cukup: daftarkan widget di manifest backend-nya (muncul di
 * extensions.widgets), lalu daftarkan komponen di REGISTRY ini.
 * Widget yang terdaftar backend tapi belum punya komponen -> kartu placeholder
 * (WidgetFallback), jadi manifest boleh mendahului implementasi UI.
 */

interface WidgetListRecord {
  id: number;
  [key: string]: unknown;
}

/** Data ringkas widget: {total, rows: [{id, title, subtitle?, status?}]}. */
interface WidgetData {
  total: number;
  rows: { id: number; title: string; subtitle?: string; status?: string }[];
}

const LIST_FIELDS = ["name", "title", "subject", "label"] as const;
const SUBTITLE_FIELDS = ["status", "state", "type"] as const;

function useWidgetData(apiPath: string): {
  data: WidgetData;
  isPending: boolean;
} {
  const token = getToken();
  const { data, isPending } = useQuery({
    queryKey: ["spine", "widget", apiPath, token],
    queryFn: async () => {
      const res = await api<{ data: WidgetListRecord[] }>(apiPath);
      if (!res.ok) throw new Error(res.error ?? "Gagal memuat widget");
      const items = res.data?.data ?? [];
      const rows = items.slice(0, 5).map((r) => {
        const title =
          (LIST_FIELDS.find((f) => typeof r[f] === "string") &&
            String(r[LIST_FIELDS.find((f) => typeof r[f] === "string")!])) ||
          `#${r.id}`;
        const sub = SUBTITLE_FIELDS.find((f) => typeof r[f] === "string");
        return {
          id: r.id,
          title,
          subtitle: sub ? String(r[sub]) : undefined,
          status: typeof r.status === "string" ? r.status : undefined,
        };
      });
      return { total: items.length, rows };
    },
    enabled: Boolean(token) && Boolean(apiPath),
  });
  return { data: data ?? { total: 0, rows: [] }, isPending };
}

function ActivityLogWidget() {
  const { data, isPending } = useWidgetData("/api/v1/activity-logs");
  return <WidgetListBody label="aktivitas" data={data} isPending={isPending} />;
}

function QuickLinksWidget() {
  // Widget quick-links: statis (tidak butuh API)
  return <QuickLinksBody />;
}

function WidgetListBody({
  label,
  data,
  isPending,
}: {
  label: string;
  data: WidgetData;
  isPending: boolean;
}) {
  if (isPending) {
    return <p className="text-sm text-ink-muted">Memuat...</p>;
  }
  if (data.total === 0) {
    return <p className="text-sm text-ink-muted">Belum ada {label}.</p>;
  }
  return (
    <div className="space-y-2">
      <p className="text-sm text-ink-muted">
        {data.total} {label} terdaftar — 5 terbaru:
      </p>
      <ul className="divide-y divide-line-soft rounded-lg border border-line-soft">
        {data.rows.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between gap-2 px-3 py-1.5 text-sm"
          >
            <span className="truncate text-ink">
              {r.title}
              {r.subtitle && r.subtitle !== r.title && (
                <span className="ml-2 text-xs text-ink-faint">{r.subtitle}</span>
              )}
            </span>
            {r.status && (
              <span
                className={`badge inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                  r.status === "aktif"
                    ? "bg-success/10 text-success"
                    : r.status === "nonaktif"
                    ? "bg-danger/10 text-danger"
                    : "bg-surface-overlay text-ink-muted"
                }`}
              >
                {r.status}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuickLinksBody() {
  const links = [
    { href: "/settings", label: "Settings", icon: "⚙️" },
    { href: "/meta", label: "Meta", icon: "🏷️" },
    { href: "/tags", label: "Tags", icon: "🔖" },
    { href: "/qr-code", label: "QR Code", icon: "▦" },
    { href: "/number-to-word", label: "Number to Word", icon: "🔢" },
    { href: "/pdf", label: "PDF", icon: "📄" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className="rounded-lg border border-line-soft bg-surface-raised p-3 transition-colors hover:border-accent/40"
        >
          <div className="text-lg">{l.icon}</div>
          <div className="mt-1 text-sm font-medium text-ink">{l.label}</div>
        </a>
      ))}
    </div>
  );
}

/** Widget terdaftar di backend tanpa komponen frontend. */
function WidgetFallback({ widget }: { widget: ModuleWidget }) {
  return (
    <p className="text-sm text-ink-muted">
      Widget "{widget.title}" dari modul <em>{widget.module}</em> belum
      diimplementasikan di frontend — daftarkan komponennya di registry.
    </p>
  );
}

const REGISTRY: Record<string, ComponentType<{ apiPath: string }>> = {
  "activity-log": ActivityLogWidget,
  "quick-links": QuickLinksWidget,
};

/** Body widget dari registry; fallback bila belum terdaftar komponennya. */
export function WidgetBody({ widget }: { widget: ModuleWidget }) {
  const Component = REGISTRY[widget.id];
  if (!Component) return <WidgetFallback widget={widget} />;
  return <Component apiPath={widget.api} />;
}

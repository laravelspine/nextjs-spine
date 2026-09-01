"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button, Card, ErrorNotice, Field, Input, PageHeader } from "@/lib/ui";
import { SmallTable, type SmallTableColumn } from "@/lib/small-table";
import { useModuleExtensions } from "@/lib/module-extensions";

interface SampleTask {
  id: number;
  ulid?: string;
  sample_item_id: number;
  title: string;
  status: string;
  created_at?: string;
}

interface SampleItem {
  id: number;
  name: string;
}

const STATUSES = ["pending", "in_progress", "done"] as const;

const columns: SmallTableColumn<SampleTask>[] = [
  {
    key: "id",
    label: "ID",
    primary: true,
    render: (it) => <span className="text-ink-faint">#{it.id}</span>,
  },
  {
    key: "title",
    label: "Title",
    primary: true,
    render: (it) => <span className="font-medium text-ink">{it.title}</span>,
  },
  {
    key: "sample_item_id",
    label: "Parent",
    render: (it) => (
      <span className="text-ink-muted">#{it.sample_item_id}</span>
    ),
  },
  {
    key: "status",
    label: "Status",
    primary: true,
    render: (it) => (
      <span
        className={
          "rounded-full px-2 py-0.5 text-xs font-medium " +
          (it.status === "done"
            ? "bg-emerald-100 text-emerald-700"
            : it.status === "in_progress"
              ? "bg-amber-100 text-amber-700"
              : "bg-slate-100 text-slate-600")
        }
      >
        {it.status}
      </span>
    ),
  },
  {
    key: "created_at",
    label: "Dibuat",
    render: (it) => (
      <span className="text-ink-muted">
        {it.created_at ? new Date(it.created_at).toLocaleDateString() : "—"}
      </span>
    ),
  },
];

export default function SampleTasksPage() {
  const [items, setItems] = useState<SampleTask[]>([]);
  const [sampleItems, setSampleItems] = useState<SampleItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SampleTask | null>(null);
  const [smallView, setSmallView] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<string>("pending");
  const [parentId, setParentId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { detail_tabs } = useModuleExtensions();
  const tabs = detail_tabs["sampletasks"] ?? [];

  // Hash #id (padanan do_hash_helper): pilih record dari URL saat load.
  useEffect(() => {
    const h = Number(window.location.hash.replace("#", ""));
    if (h) setSelectedId(h);
  }, []);

  const load = useCallback(() => {
    api<{ data: SampleTask[] }>("/api/v1/sample-tasks").then((res) => {
      if (res.ok) setItems(res.data?.data ?? []);
    });
    // Parent list untuk dropdown di modal (dari modul Sample).
    api<{ data: SampleItem[] }>("/api/v1/sample").then((res) => {
      if (res.ok) setSampleItems(res.data?.data ?? []);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function selectItem(id: number | string) {
    const n = Number(id);
    setSelectedId(n);
    window.location.hash = String(n);
  }

  async function onSave() {
    if (!title.trim() || !parentId) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        sample_item_id: Number(parentId),
        title: title.trim(),
        status,
      };
      const url = editing
        ? `/api/v1/sample-tasks/${editing.id}`
        : "/api/v1/sample-tasks";
      const res = await api(url, {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError(res.error ?? "Gagal menyimpan");
        return;
      }
      const savedId = (res.data as SampleTask).id;
      setTitle("");
      setStatus("pending");
      setParentId("");
      setOpen(false);
      setEditing(null);
      await load();
      setSelectedId(savedId);
      window.location.hash = String(savedId);
      setRefreshKey((k) => k + 1);
    } catch {
      setError("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  function openEdit(item: SampleTask) {
    setTitle(item.title);
    setStatus(item.status);
    setParentId(String(item.sample_item_id));
    setError(null);
    setEditing(item);
    setOpen(true);
  }

  function onPdf(item: SampleTask) {
    const html = encodeURIComponent(
      `<h1>Sample Task #${item.id} — ${item.title}</h1>` +
        `<p>Parent: #${item.sample_item_id} | Status: ${item.status}</p>`
    );
    window.open(`/api/v1/pdf/from-html?html=${html}`, "_blank");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sample Tasks"
        desc="Child module SampleTasks — task milik SampleItem, klik baris untuk detail + status-change hook."
        action={<Button onClick={() => setOpen(true)}>Add Task</Button>}
      />

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            setOpen(false);
            setEditing(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-line-soft bg-surface-raised p-5 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-sm font-semibold text-ink">
              {editing ? `Edit Task #${editing.id}` : "Create Task"}
            </h2>
            <div className="space-y-3">
              <Field label="Sample Item (parent)">
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full rounded-lg border border-line-soft bg-surface-raised px-3 py-2 text-sm text-ink"
                >
                  <option value="">Pilih parent...</option>
                  {sampleItems.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.id} — {s.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Title">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul task..."
                  autoFocus
                />
              </Field>
              <Field label="Status">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-line-soft bg-surface-raised px-3 py-2 text-sm text-ink"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            {error && (
              <div className="mt-3">
                <ErrorNotice message={error} />
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                }}
              >
                Batal
              </Button>
              <Button
                onClick={onSave}
                disabled={saving || !title.trim() || !parentId}
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <SmallTable
        items={items}
        tabs={tabs}
        columns={columns}
        selectedId={selectedId}
        onSelectId={(id) => {
          selectItem(id);
          setSmallView(true);
        }}
        getItemId={(it) => it.id}
        showDetail={smallView}
        refreshKey={refreshKey}
        toolbar={(item) => (
          <>
            <Button variant="secondary" onClick={() => openEdit(item)}>
              Edit
            </Button>
            <Button variant="secondary" onClick={() => onPdf(item)}>
              PDF
            </Button>
            <Button
              variant="secondary"
              onClick={() => setSmallView((v) => !v)}
              title="Toggle small view"
            >
              {smallView ? "◀" : "▶"}
            </Button>
          </>
        )}
      />
    </div>
  );
}

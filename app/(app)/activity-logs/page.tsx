"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Badge, EmptyState, ErrorNotice, PageHeader } from "@/lib/ui";

interface ActivityLog {
  id: number;
  description: string;
  subject_type: string | null;
  subject_id: number | null;
  causer_id: number | null;
  created_at: string | null;
}

function toneFor(subjectType: string | null): "accent" | "neutral" | "info" {
  if (subjectType === "user") return "accent";
  if (subjectType === "file") return "info";
  return "neutral";
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<ActivityLog[]>("/api/v1/activity-logs")
      .then((res) => {
        if (!res.ok) {
          setError(res.error ?? "Gagal memuat");
          return;
        }
        setLogs(Array.isArray(res.data) ? res.data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-ink-muted">Memuat...</p>;

  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader title="Activity Logs" />
        <ErrorNotice
          message={`${error} — pastikan sudah login lewat tautan di sidebar.`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Logs"
        desc="GET /api/v1/activity-logs — contoh resource REST."
      />

      {logs.length === 0 ? (
        <EmptyState message="Belum ada aktivitas." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line-soft">
          <table className="w-full text-sm">
            <thead className="bg-surface-raised text-left text-ink-faint">
              <tr>
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Deskripsi</th>
                <th className="px-4 py-2 font-medium">Subject</th>
                <th className="px-4 py-2 font-medium">Oleh</th>
                <th className="px-4 py-2 font-medium">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-2 text-ink-faint">{log.id}</td>
                  <td className="px-4 py-2 text-ink">{log.description}</td>
                  <td className="px-4 py-2">
                    {log.subject_type ? (
                      <Badge tone={toneFor(log.subject_type)}>
                        {log.subject_type}:{log.subject_id}
                      </Badge>
                    ) : (
                      <span className="text-ink-faint">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-ink-muted">{log.causer_id ?? "—"}</td>
                  <td className="px-4 py-2 text-ink-muted">
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString("id-ID")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ActivityLog {
  id: number;
  description: string;
  subject_type: string | null;
  subject_id: number | null;
  causer_id: number | null;
  created_at: string | null;
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

  if (loading) return <p className="text-zinc-500">Memuat...</p>;

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Activity Logs</h1>
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error} — pastikan sudah{" "}
          <a href="/login" className="underline">
            login
          </a>
          .
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Activity Logs</h1>
        <p className="mt-1 text-sm text-zinc-500">
          GET /api/v1/activity-logs — contoh resource REST.
        </p>
      </header>

      {logs.length === 0 ? (
        <p className="text-zinc-500">Belum ada aktivitas.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-left text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Deskripsi</th>
                <th className="px-4 py-2 font-medium">Subject</th>
                <th className="px-4 py-2 font-medium">Oleh</th>
                <th className="px-4 py-2 font-medium">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-2 text-zinc-500">{log.id}</td>
                  <td className="px-4 py-2">{log.description}</td>
                  <td className="px-4 py-2 text-zinc-500">
                    {log.subject_type ? `${log.subject_type}:${log.subject_id}` : "—"}
                  </td>
                  <td className="px-4 py-2 text-zinc-500">{log.causer_id ?? "—"}</td>
                  <td className="px-4 py-2 text-zinc-500">
                    {log.created_at ? new Date(log.created_at).toLocaleString("id-ID") : "—"}
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

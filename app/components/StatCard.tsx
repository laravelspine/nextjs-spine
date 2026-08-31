"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/**
 * StatCard — kartu statistik ala Supabase: angka besar, label kecil
 * uppercase, border-defined (tanpa shadow). Aksen emerald hanya di
 * angka/ikon, bukan background.
 */
export function StatCard({
  label,
  value,
  accent = false,
  hint,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-line-soft bg-surface-raised p-5">
      <div className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
        {label}
      </div>
      <div
        className={
          "mt-2 text-3xl font-bold tracking-tight " +
          (accent ? "text-accent-strong" : "text-ink")
        }
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-ink-faint">{hint}</div>}
    </div>
  );
}

/**
 * useApiCount — fetch list, ambil panjangnya. Untuk stat sederhana
 * (activity-logs, tags) tanpa endpoint count khusus.
 */
export function useApiCount(path: string) {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<unknown[]>(path)
      .then((res) => {
        if (!res.ok) {
          setError(res.error ?? "Gagal");
          return;
        }
        setCount(Array.isArray(res.data) ? res.data.length : 0);
      })
      .catch(() => setError("Gagal memuat"));
  }, [path]);

  return { count, error };
}

"use client";

import { useEffect, useState } from "react";
import { api } from "./api";

/**
 * Baca setting `tables_pagination_limit` (default 10) — dipakai SmallTable.
 * Setting didefinisikan di core (settings-tabs.php) dan dikelola dari
 * halaman Settings.
 */
export function usePaginationLimit(): number {
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    // Respons: {key, value} — 404 kalau belum pernah di-set (default 10).
    api<{ key?: string; value?: string | number }>(
      "/api/v1/settings/tables_pagination_limit"
    )
      .then((res) => {
        if (res.ok) {
          const v = Number(res.data?.value ?? 10);
          if (v > 0) setLimit(v);
        }
      })
      .catch(() => {});
  }, []);

  return limit;
}

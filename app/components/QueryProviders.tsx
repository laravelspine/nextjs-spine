"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

/**
 * React Query provider — membuat QueryClient sekali per-mount (stableId).
 * Dipakai di root layout supaya semua useQuery / useMutation bekerja.
 */
export function QueryProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale-ness: refresh tiap 30 detik jika tidak ada aktivitas.
            staleTime: 30_000,
            // Retry 1x untuk koneksi yang kadang putus (Reverb/SSL).
            retry: 1,
            // Jangan throw error ke boundary — komponen handle sendiri.
            throwOnError: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

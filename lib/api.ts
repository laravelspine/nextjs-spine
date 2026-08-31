/**
 * Tipis: satu helper fetch ke API Spine dengan token bearer.
 * Tidak ada abstraksi berlapis — tambah fitur saat dibutuhkan.
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("spine_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("spine_token", token);
  else localStorage.removeItem("spine_token");
}

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // body kosong
  }

  if (!res.ok) {
    const err = (data as { message?: string })?.message ?? `HTTP ${res.status}`;
    return { ok: false, status: res.status, data: data as T, error: err };
  }

  return { ok: true, status: res.status, data: data as T };
}

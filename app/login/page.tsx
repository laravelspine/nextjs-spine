"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await api<{ token: string; user: { name: string; email: string } }>(
      "/api/v1/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );

    setLoading(false);

    if (!res.ok || !res.data.token) {
      setError(res.error ?? "Login gagal");
      return;
    }

    setToken(res.data.token);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 pt-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Masuk</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Demo: <code className="text-emerald-400">demo@spine.test</code> /{" "}
          <code className="text-emerald-400">password</code>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            placeholder="demo@spine.test"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            placeholder="password"
          />
        </div>

        {error && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-emerald-500 py-2 font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        Belum punya akun?{" "}
        <Link href="/register" className="text-emerald-400 hover:underline">
          Daftar
        </Link>
      </p>
    </div>
  );
}

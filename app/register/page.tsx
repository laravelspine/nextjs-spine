"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button, Card, ErrorNotice, Field, Input } from "@/lib/ui";

export default function RegisterPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await api<{ token: string }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok || !res.data.token) {
      setLoading(false);
      setError(res.error ?? "Registrasi gagal");
      return;
    }

    await signIn(res.data.token);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 pt-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-ink">Daftar</h1>
        <p className="mt-1 text-sm text-ink-muted">Buat akun baru di Spine</p>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Nama">
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Lengkap"
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
            />
          </Field>

          {error && <ErrorNotice message={error} />}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Memproses..." : "Daftar"}
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-ink-muted">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-accent-strong hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}

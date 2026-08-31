"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button, Card, ErrorNotice, Field, Input } from "@/lib/ui";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await api<{ token: string }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok || !res.data.token) {
      setLoading(false);
      setError(res.error ?? "Login gagal");
      return;
    }

    await signIn(res.data.token);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 pt-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-ink">Masuk</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Demo: <code className="text-accent-strong">demo@spine.test</code> /{" "}
          <code className="text-accent-strong">password</code>
        </p>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Email">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@spine.test"
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
            />
          </Field>

          {error && <ErrorNotice message={error} />}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-ink-muted">
        Belum punya akun?{" "}
        <Link href="/register" className="text-accent-strong hover:underline">
          Daftar
        </Link>
      </p>
    </div>
  );
}

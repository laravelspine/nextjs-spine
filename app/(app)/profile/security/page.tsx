"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button, Card } from "@/lib/ui";

interface PasswordForm {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export default function ProfileSecurityPage() {
  const { user } = useAuth();
  const [form, setForm] = useState<PasswordForm>({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  function handleChange(field: keyof PasswordForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError(null);
    setSuccess(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.password.length < 8) {
      setError("Sandi baru minimal 8 karakter.");
      return;
    }
    if (form.password !== form.password_confirmation) {
      setError("Konfirmasi sandi tidak cocok.");
      return;
    }

    setSaving(true);
    try {
      const res = await api(`/api/v1/users/${user!.id}`, {
        method: "PUT",
        body: JSON.stringify({ password: form.password }),
      });
      if (!res.ok) {
        setError(res.error ?? "Gagal mengubah sandi.");
        return;
      }
      setSuccess("Sandi berhasil diubah.");
      setForm({ current_password: "", password: "", password_confirmation: "" });
    } catch {
      setError("Terjadi kesalahan saat mengubah sandi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="Keamanan">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>
        )}
        {success && (
          <p className="rounded-md bg-accent-soft px-3 py-2 text-sm text-accent-strong">{success}</p>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Sandi Saat Ini
          </label>
          <input
            type="password"
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            value={form.current_password}
            onChange={(e) => handleChange("current_password", e.target.value)}
            placeholder="Masukkan sandi saat ini"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Sandi Baru
          </label>
          <input
            type="password"
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="Minimal 8 karakter"
            minLength={8}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Konfirmasi Sandi Baru
          </label>
          <input
            type="password"
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            value={form.password_confirmation}
            onChange={(e) => handleChange("password_confirmation", e.target.value)}
            placeholder="Ulangi sandi baru"
          />
        </div>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Menyimpan..." : "Ubah Sandi"}
        </Button>
      </form>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button, Card, EmptyState, ErrorNotice, Input, PageHeader } from "@/lib/ui";
import { useI18n } from "@/lib/i18n-context";

interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

export default function UsersPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRoles, setNewRoles] = useState("");

  async function loadUsers() {
    setLoading(true);
    setError(null);
    const res = await api<{ data: User[] }>("/api/v1/users");
    if (!res.ok) {
      setError(res.error ?? t("common.loading"));
    } else {
      setUsers(Array.isArray(res.data?.data) ? res.data.data : []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await api("/api/v1/users", {
      method: "POST",
      body: JSON.stringify({
        name: newName,
        email: newEmail,
        password: newPassword,
        roles: newRoles ? newRoles.split(",").map((r) => r.trim()).filter(Boolean) : [],
      }),
    });
    if (!res.ok) {
      setError(res.error ?? "Gagal membuat pengguna");
      return;
    }
    setShowCreate(false);
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewRoles("");
    loadUsers();
  }

  async function handleDelete(id: number) {
    if (!confirm(t("users.delete_confirm"))) return;
    const res = await api(`/api/v1/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError(res.error ?? "Gagal menghapus pengguna");
      return;
    }
    loadUsers();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("users.title")}
        desc={t("users.description")}
        action={
          <Button onClick={() => setShowCreate(true)}>
            {t("users.add_user")}
          </Button>
        }
      />

      {error && <ErrorNotice message={error} />}

      {loading ? (
        <p className="text-ink-muted">{t("common.loading")}</p>
      ) : users.length === 0 ? (
        <EmptyState message={t("common.no_data")} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line-soft bg-surface-raised">
          <table className="w-full text-sm">
            <thead className="bg-surface-raised text-left text-xs uppercase tracking-wider text-ink-faint">
              <tr>
                <th className="px-4 py-2 font-medium">{t("users.name")}</th>
                <th className="px-4 py-2 font-medium">{t("users.email")}</th>
                <th className="px-4 py-2 font-medium">{t("users.roles")}</th>
                <th className="px-4 py-2 font-medium">{t("users.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-overlay">
                  <td className="px-4 py-3 text-ink font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-ink-muted">{user.email}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {user.roles?.join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-sm text-danger hover:underline"
                    >
                      {t("common.delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <Card title={t("users.create_user")}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">{t("users.name")}</label>
              <Input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">{t("users.email")}</label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">{t("users.password")}</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">{t("users.roles")}</label>
              <Input
                type="text"
                value={newRoles}
                onChange={(e) => setNewRoles(e.target.value)}
                placeholder={t("users.roles_placeholder")}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit">{t("common.save")}</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

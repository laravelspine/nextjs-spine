"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button, Card, EmptyState, ErrorNotice, Input, PageHeader } from "@/lib/ui";
import { useI18n } from "@/lib/i18n-context";

interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions: string[];
}

interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

export default function RbacPage() {
  const { t } = useI18n();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showCreatePerm, setShowCreatePerm] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newPermName, setNewPermName] = useState("");

  async function loadRoles() {
    const res = await api<{ data: Role[] }>("/api/v1/roles");
    if (!res.ok) {
      setError(res.error ?? "Gagal memuat peran");
    } else {
      setRoles(Array.isArray(res.data?.data) ? res.data.data : []);
    }
  }

  async function loadPermissions() {
    const res = await api<{ data: Permission[] }>("/api/v1/permissions");
    if (!res.ok) {
      setError(res.error ?? "Gagal memuat izin");
    } else {
      setPermissions(Array.isArray(res.data?.data) ? res.data.data : []);
    }
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([loadRoles(), loadPermissions()])
      .finally(() => setLoading(false));
  }, []);

  async function handleCreateRole(e: React.FormEvent) {
    e.preventDefault();
    const res = await api("/api/v1/roles", {
      method: "POST",
      body: JSON.stringify({ name: newRoleName, permissions: [] }),
    });
    if (!res.ok) {
      setError(res.error ?? "Gagal membuat peran");
      return;
    }
    setShowCreateRole(false);
    setNewRoleName("");
    loadRoles();
  }

  async function handleCreatePerm(e: React.FormEvent) {
    e.preventDefault();
    const res = await api("/api/v1/permissions", {
      method: "POST",
      body: JSON.stringify({ name: newPermName }),
    });
    if (!res.ok) {
      setError(res.error ?? "Gagal membuat izin");
      return;
    }
    setShowCreatePerm(false);
    setNewPermName("");
    loadPermissions();
  }

  async function handleDeleteRole(id: number) {
    if (!confirm(t("common.confirm_delete"))) return;
    const res = await api(`/api/v1/roles/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError(res.error ?? "Gagal menghapus peran");
      return;
    }
    loadRoles();
  }

  async function handleDeletePermission(id: number) {
    if (!confirm(t("common.confirm_delete"))) return;
    const res = await api(`/api/v1/permissions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError(res.error ?? "Gagal menghapus izin");
      return;
    }
    loadPermissions();
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("rbac.title")} desc={t("rbac.description")} />

      {error && <ErrorNotice message={error} />}

      {loading ? (
        <p className="text-ink-muted">{t("common.loading")}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Roles */}
          <section className="rbac-section">
            <div className="rbac-section__header flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">{t("rbac.roles")}</h2>
              <Button onClick={() => setShowCreateRole(true)}>{t("rbac.add_role")}</Button>
            </div>

            {roles.length === 0 ? (
              <EmptyState message={t("common.no_data")} />
            ) : (
              <div className="rbac-section__list space-y-3">
                {roles.map((role) => (
                  <Card key={role.id} className="role-card p-4">
                    <div className="role-card__body flex items-start justify-between">
                      <div className="role-card__info">
                        <div className="role-card__name text-sm font-medium text-ink">{role.name}</div>
                        <div className="role-card__guard text-xs text-ink-faint mt-1">{role.guard_name}</div>
                        <div className="role-card__permissions text-xs text-ink-muted mt-1">
                          {role.permissions?.length > 0
                            ? role.permissions.join(", ")
                            : t("rbac.assigned_permissions")}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="role-card__delete text-sm text-danger hover:underline"
                      >
                        {t("common.delete")}
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Permissions */}
          <section className="rbac-section">
            <div className="rbac-section__header flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">{t("rbac.permissions")}</h2>
              <Button onClick={() => setShowCreatePerm(true)}>{t("rbac.add_permission")}</Button>
            </div>

            {permissions.length === 0 ? (
              <EmptyState message={t("common.no_data")} />
            ) : (
              <div className="rbac-section__list space-y-3">
                {permissions.map((perm) => (
                  <Card key={perm.id} className="permission-card p-4">
                    <div className="permission-card__body flex items-start justify-between">
                      <div className="permission-card__info">
                        <div className="permission-card__name text-sm font-medium text-ink">{perm.name}</div>
                        <div className="permission-card__guard text-xs text-ink-faint mt-1">{perm.guard_name}</div>
                      </div>
                      <button
                        onClick={() => handleDeletePermission(perm.id)}
                        className="permission-card__delete text-sm text-danger hover:underline"
                      >
                        {t("common.delete")}
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateRole && (
        <Card title={t("rbac.add_role")}>
          <form onSubmit={handleCreateRole} className="space-y-4">
            <div className="form-field">
              <label className="mb-1 block text-sm font-medium text-ink">{t("rbac.role_name")}</label>
              <Input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                required
              />
            </div>
            <div className="form-field__actions flex gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={() => setShowCreateRole(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit">{t("common.save")}</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Create Permission Modal */}
      {showCreatePerm && (
        <Card title={t("rbac.add_permission")}>
          <form onSubmit={handleCreatePerm} className="space-y-4">
            <div className="form-field">
              <label className="mb-1 block text-sm font-medium text-ink">{t("rbac.permission_name")}</label>
              <Input
                type="text"
                value={newPermName}
                onChange={(e) => setNewPermName(e.target.value)}
                required
              />
            </div>
            <div className="form-field__actions flex gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={() => setShowCreatePerm(false)}>
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

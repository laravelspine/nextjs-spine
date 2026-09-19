"use client";

import { useAuth } from "@/lib/auth-context";
import { Badge, Card } from "@/lib/ui";

export default function ProfileOverviewPage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <Card title="Ikhtisar">
      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-faint">Nama</div>
          <div className="mt-1 text-sm font-medium text-ink">{user.name}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-faint">Email</div>
          <div className="mt-1 text-sm text-ink">{user.email}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-faint">User ID</div>
          <div className="mt-1">
            <Badge tone="accent">id {user.id}</Badge>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-faint">Status</div>
          <div className="mt-1">
            <Badge tone="success">Aktif</Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}

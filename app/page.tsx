"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/lib/ui";
import { StatCard, useApiCount } from "@/app/components/StatCard";

interface ActivityLog {
  id: number;
  description: string;
  subject_type: string | null;
  subject_id: number | null;
  created_at: string | null;
}

const quickLinks = [
  { href: "/settings", label: "Settings", icon: "⚙️" },
  { href: "/meta", label: "Meta", icon: "🏷️" },
  { href: "/tags", label: "Tags", icon: "🔖" },
  { href: "/qr-code", label: "QR Code", icon: "▦" },
  { href: "/number-to-word", label: "Number to Word", icon: "🔢" },
  { href: "/pdf", label: "PDF", icon: "📄" },
];

function ActivityFeed() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<ActivityLog[]>("/api/v1/activity-logs")
      .then((res) => {
        if (!res.ok) {
          setError(res.error ?? "Gagal memuat");
          return;
        }
        setLogs(Array.isArray(res.data) ? res.data.slice(0, 8) : []);
      })
      .catch(() => setError("Gagal memuat"));
  }, []);

  if (error) {
    return <p className="text-sm text-ink-faint">Tidak bisa memuat aktivitas.</p>;
  }

  if (logs.length === 0) {
    return <p className="text-sm text-ink-faint">Belum ada aktivitas.</p>;
  }

  return (
    <ol className="space-y-4">
      {logs.map((log) => (
        <li key={log.id} className="flex items-start gap-3">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent/60" />
          <div className="min-w-0">
            <p className="truncate text-sm text-ink">{log.description}</p>
            <p className="mt-0.5 text-xs text-ink-faint">
              {log.created_at
                ? new Date(log.created_at).toLocaleString("id-ID")
                : "—"}
              {log.subject_type ? ` · ${log.subject_type}:${log.subject_id}` : ""}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  const logs = useApiCount("/api/v1/activity-logs");
  const tags = useApiCount("/api/v1/tags");

  if (loading) {
    return <p className="text-ink-muted">Memuat...</p>;
  }

  if (user) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <section>
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
            Dashboard
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
            Selamat datang kembali,{" "}
            <span className="text-accent-strong">{user.name}</span>
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-ink-muted">
            <span>Login sebagai {user.email}</span>
            <Badge tone="accent">id {user.id}</Badge>
          </p>
        </section>

        {/* Stat cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Activity Logs"
            value={logs.count ?? "—"}
            accent
            hint="GET /api/v1/activity-logs"
          />
          <StatCard
            label="Tags"
            value={tags.count ?? "—"}
            hint="GET /api/v1/tags"
          />
          <StatCard label="Fitur API" value="57+" hint="Endpoint stabil /api/v1" />
          <StatCard label="Contoh Halaman" value={quickLinks.length} hint="Lihat sidebar" />
        </section>

        {/* Widgets */}
        <section className="grid gap-4 lg:grid-cols-5">
          {/* Widget area kiri: activity feed */}
          <div className="lg:col-span-3 rounded-xl border border-line-soft bg-surface-raised p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Aktivitas Terbaru</h2>
              <Link
                href="/activity-logs"
                className="text-xs text-accent-strong hover:underline"
              >
                Lihat semua
              </Link>
            </div>
            <ActivityFeed />
          </div>

          {/* Widget area kanan: quick links */}
          <div className="lg:col-span-2 rounded-xl border border-line-soft bg-surface-raised p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">Contoh Halaman</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg border border-line-soft bg-surface p-3 transition-colors hover:border-accent/40"
                >
                  <div className="text-lg">{l.icon}</div>
                  <div className="mt-1 text-sm font-medium text-ink">{l.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Landing (belum login)
  return (
    <div className="space-y-12">
      <section className="pt-8 pb-4">
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Spine<span className="text-accent-strong">.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">
          Core package Laravel untuk aplikasi bisnis: auth, settings, files,
          meta, mail, sms, pdf, dan hook event — dipakai bersama oleh semua
          konsumen. Situs ini adalah <em>contoh aplikasi</em> yang mengonsumsi
          API-nya.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {[
          {
            title: "API v1 ter-versi",
            desc: "57+ endpoint stabil di /api/v1 — settings, meta, files, tags, mail, sms, pdf, qr-code, excel, activity logs, dll.",
            href: "/api",
            label: "Lihat daftar endpoint",
          },
          {
            title: "Hook berbasis event",
            desc: "FileUploading, PdfCreating, MailSending, DateFormatting, RelationResolving — semua titik ekstensi memakai Laravel Events.",
            href: "/hooks",
            label: "Registry hook",
          },
          {
            title: "Multi-tenant siap",
            desc: "Tenant scope di settings, meta, dan files — path penyimpanan dan data terisolasi per tenant.",
            href: "/tenants",
            label: "Model tenant",
          },
          {
            title: "Auth Sanctum",
            desc: "Login/register/logout/me via token — contoh nyata pakai API di aplikasi ini.",
            href: "/login",
            label: "Coba login",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-line-soft bg-surface-raised p-5 transition-colors hover:border-accent/40"
          >
            <h2 className="font-semibold text-accent-strong">{f.title}</h2>
            <p className="mt-2 text-sm text-ink-muted">{f.desc}</p>
            <Link
              href={f.href}
              className="mt-3 inline-block text-sm font-medium text-ink transition-colors hover:text-accent-strong"
            >
              {f.label} →
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}

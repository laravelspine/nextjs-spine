"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const quickLinks = [
  { href: "/settings", label: "Settings", icon: "⚙️" },
  { href: "/meta", label: "Meta", icon: "🏷️" },
  { href: "/tags", label: "Tags", icon: "🔖" },
  { href: "/qr-code", label: "QR Code", icon: "▦" },
  { href: "/number-to-word", label: "Number to Word", icon: "🔢" },
  { href: "/pdf", label: "PDF", icon: "📄" },
];

/**
 * / — landing page (publik). Setelah login, {user} dialihkan ke dashboard
 * lewat tautan di bawah; isi statistik/aktivitas ada di /dashboard.
 */
export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-ink-muted">Memuat...</p>;
  }

  if (user) {
    return (
      <div className="space-y-12 pt-8">
        <section>
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Selamat datang kembali, <span className="text-accent-strong">{user.name}</span>
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Anda sudah login. Lanjut ke {" "}
            <Link href="/dashboard" className="font-medium text-accent-strong hover:underline">
              Dashboard
            </Link>{" "}
            atau pilih contoh halaman di sidebar.
          </p>
        </section>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg border border-line-soft bg-surface-raised p-4 transition-colors hover:border-accent/40"
            >
              <div className="text-lg">{l.icon}</div>
              <div className="mt-1 text-sm font-medium text-ink">{l.label}</div>
            </Link>
          ))}
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
"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const features = [
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
];

const examples = [
  { href: "/settings", label: "Settings", desc: "GET/PUT /api/v1/settings/{key}" },
  { href: "/meta", label: "Meta", desc: "CRUD /api/v1/meta/{type}/{id}/{key}" },
  { href: "/tags", label: "Tags", desc: "CRUD /api/v1/tags" },
  { href: "/qr-code", label: "QR Code", desc: "POST /api/v1/qr-code/generate" },
  { href: "/number-to-word", label: "Number to Word", desc: "POST /api/v1/number-to-word/convert" },
  { href: "/pdf", label: "PDF", desc: "POST /api/v1/pdf/from-html" },
  { href: "/activity-logs", label: "Activity Logs", desc: "GET /api/v1/activity-logs" },
];

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-zinc-500">Memuat...</p>;
  }

  if (user) {
    return (
      <div className="space-y-10">
        <section>
          <h1 className="text-3xl font-bold">
            Halo, <span className="text-emerald-400">{user.name}</span>
          </h1>
          <p className="mt-2 text-zinc-400">
            Login sebagai <code className="text-zinc-300">{user.email}</code> (id {user.id}).
            Berikut contoh halaman yang mengonsumsi API Spine.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Main menu</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {examples.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 hover:border-emerald-500/40 hover:bg-zinc-900 transition-colors"
              >
                <div className="font-medium">{e.label}</div>
                <div className="mt-1 text-xs text-zinc-500">{e.desc}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <section className="pt-8 pb-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Spine<span className="text-emerald-400">.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-400">
          Core package Laravel untuk aplikasi bisnis: auth, settings, files,
          meta, mail, sms, pdf, dan hook event — dipakai bersama oleh semua
          konsumen. Situs ini adalah <em>contoh aplikasi</em> yang mengonsumsi
          API-nya.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-emerald-500/40 transition-colors"
          >
            <h2 className="font-semibold text-emerald-400">{f.title}</h2>
            <p className="mt-2 text-sm text-zinc-400">{f.desc}</p>
            <Link
              href={f.href}
              className="mt-3 inline-block text-sm font-medium text-zinc-300 hover:text-emerald-400 transition-colors"
            >
              {f.label} →
            </Link>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-xl font-semibold">Main menu — contoh halaman</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {examples.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 hover:border-emerald-500/40 hover:bg-zinc-900 transition-colors"
            >
              <div className="font-medium">{e.label}</div>
              <div className="mt-1 text-xs text-zinc-500">{e.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

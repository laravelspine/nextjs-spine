# nextjs-spine

Landing page dan contoh aplikasi untuk [`spine/laravel-spine`](https://github.com/laravelspine/laravelspine) — Next.js App Router + TypeScript + Tailwind.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Login demo: `demo@spine.test` / `password`.

## Konfigurasi

Salin ke `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Arahkan ke base URL API Spine (tanpa trailing slash) — sesuaikan dengan
lingkungan dev lokal Anda.

## Struktur

```
app/
  page.tsx               # landing (publik) + tautan login
  (auth)/
    login/               # POST /api/v1/auth/login
    register/            # POST /api/v1/auth/register
  (app)/                 # gerbang login (layout guard) — semua butuh token
    dashboard/           # beranda setelah login: stat + aktivitas + widget
    profile/             # halaman core Profile + tab/section ekstensi UI
    settings/            # UI Settings (tab dari schema manifest + ekstensi)
    meta/                # CRUD /api/v1/meta/{type}/{id}/{key}
    tags/                # CRUD /api/v1/tags
    qr-code/             # POST /api/v1/qr-code/generate
    number-to-word/      # POST /api/v1/number-to-word/convert
    pdf/                 # POST /api/v1/pdf/from-html
    activity-logs/       # GET /api/v1/activity-logs
    sample/ sample-tasks/# contoh modul (DataTable + panel detail bertab)
  api/                   # daftar endpoint (statis)
  hooks/                 # registry event hook (statis)
  tenants/               # model multi-tenant (statis)
lib/
  api.ts                 # fetch wrapper tipis (token bearer + error)
  auth-context.tsx       # AuthProvider (token Sanctum di localStorage)
  extensions/            # UI Extension Registry + permission + i18n
  modules/               # Module Registry (kontrak SpineModule + loader + demo)
  master-detail.tsx      # helper list + panel detail bertab (induk)
  small-table.tsx        # DataTable + detail (padanan legacy)
  ui.tsx                 # design-token UI (Button, Card, Badge, ...)
```

## UI Extension & Module

`nextjs-spine` adalah **extensible frontend runtime**: module frontend
mendaftarkan UI sendiri (tab profile/settings, navigasi, widget dashboard)
lewat `lib/extensions` tanpa memodifikasi Core. Module memakai kontrak
`SpineModule` (`lib/modules/types.ts`) dan di-boot lewat `bootModules()`
di `lib/modules/index.ts`. Area ekstensi:

```
navigation.main · navigation.profile · profile.tabs · profile.sections
settings.tabs · settings.sections · dashboard.widgets
```

Contoh implementasi lengkap ada di `lib/modules/demo-referrals/` (module demo
"Referrals" — tab di /profile dan /settings, widget di dashboard, item nav).

## Pola

Semua halaman contoh memakai satu pola: `lib/api.ts` + `useState`/`useEffect`.
Token Sanctum disimpan di `localStorage` (`spine_token`) dan otomatis
dikirim sebagai `Authorization: Bearer`. Halaman core yang statis
(`api/`, `hooks/`, `tenants/`) publik; halaman di group `(app)` dilindungi
layout guard yang menyembunyikan konten saat belum login.

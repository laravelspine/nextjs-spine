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
  modules/               # kontrak SpineModule + runtime loader (discovery URL)
  master-detail.tsx      # helper list + panel detail bertab (induk)
  small-table.tsx        # DataTable + detail (padanan legacy)
  ui.tsx                 # design-token UI (Button, Card, Badge, ...)
```

## UI Extension & Module

`nextjs-spine` adalah **extensible frontend runtime**: module frontend
mendaftarkan UI sendiri (tab profile/settings, navigasi, widget dashboard)
lewat `lib/extensions` tanpa memodifikasi Core. Area ekstensi:

```
navigation.main · navigation.profile · profile.tabs · profile.sections
settings.tabs · settings.sections · dashboard.widgets
```

**Discovery backend-driven (pola WordPress/PerfexCRM):** Core TIDAK memuat
daftar modul hardcoded. Admin Laravel menentukan modul aktif; manifest
`GET /api/v1/modules/extensions` mengembalikan tiap modul aktif beserta
`entry_url` bundle frontend-nya. `app/module-host.tsx` (dipasang di root
layout) memakai `useModuleManifest()` (`lib/modules/use-modules.ts`) untuk
mengambil manifest (deps `token`) lalu `lib/modules/runtime.ts` melakukan
`import(url)` runtime pada bundle aktif. Bundle mengekspor `default`
`SpineModule` (`lib/modules/types.ts`) yang memanggil `context.ui.*.register()`
dan `context.i18n.addTranslations()`. Tanpa `entry_url`, modul tetap
berkontribusi lewat lapisan data (menu/widget/tab API).

Bridge host (`globalThis.__SPINE__`) mengekspos instance React host serta
base URL API (`lib/api.ts` `API_URL`) supaya bundle tidak membawa React sendiri
— menghindari masalah duplikasi React.

**Contoh modul frontend** (repo terpisah, struktur bundel lengkap):
`/www/wwwroot/spine-modules/sampletasks` — bundel `dist/sampletasks.module.js`
yang meregistrasi widget dashboard + tab `profile.tabs` + section
`profile.sections`, dengan `npm run build` / `serve` / `test:contract`.

**Kontrak backend** (`spine/laravel-spine`, lihat `../laravelspine/public_html`):
- `manifest.php` modul boleh menambah `'frontend' => ['entry_url' => '/api/v1/modules/assets/{alias}/{file}.js']`.
- Backend menyajikan bundle publik lewat route `GET /api/v1/modules/assets/{alias}/{file}`
  (dari `Modules/{Name}/frontend/dist/`, dengan CORS `*`) — lihat
  `ModuleController::asset()`.
- `ModuleController::extensions()` mengembalikan `modules: [{name, alias, enabled, entry_url}]`
  untuk semua modul aktif — sumber tunggal discovery frontend.

## Pola

Semua halaman contoh memakai satu pola: `lib/api.ts` + `useState`/`useEffect`.
Token Sanctum disimpan di `localStorage` (`spine_token`) dan otomatis
dikirim sebagai `Authorization: Bearer`. Halaman core yang statis
(`api/`, `hooks/`, `tenants/`) publik; halaman di group `(app)` dilindungi
layout guard yang menyembunyikan konten saat belum login.

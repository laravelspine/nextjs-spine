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
  page.tsx            # landing + main menu
  login/              # POST /api/v1/auth/login
  register/           # POST /api/v1/auth/register
  api/                # daftar endpoint (statis)
  hooks/              # registry event hook (statis)
  tenants/            # model multi-tenant (statis)
  settings/           # GET/PUT /api/v1/settings/{key}
  meta/               # CRUD /api/v1/meta/{type}/{id}/{key}
  tags/               # CRUD /api/v1/tags
  qr-code/            # POST /api/v1/qr-code/generate
  number-to-word/     # POST /api/v1/number-to-word/convert
  pdf/                # POST /api/v1/pdf/from-html
  activity-logs/      # GET /api/v1/activity-logs
lib/
  api.ts              # fetch wrapper tipis (token bearer + error)
```

## Pola

Semua halaman contoh memakai satu pola: `lib/api.ts` + `useState`/`useEffect`.
Token Sanctum disimpan di `localStorage` (`spine_token`) dan otomatis
dikirim sebagai `Authorization: Bearer`.

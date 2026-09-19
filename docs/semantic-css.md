# Semantic CSS — Konvensi Penamaan Struktur UI

Status: **aktif** — rujuk dokumen ini saat menyentuh markup, membuat komponen,
atau membuat modul baru dengan frontend. Versi awal diputuskan untuk halaman
`modules/`, lalu digulirkan ke seluruh app.

## Kenapa

Utility Tailwind (`space-y-3`, `flex`, `mt-3`) menggambarkan **tampilan**,
bukan **makna**. Akibatnya referensi lokasi jadi ambigu (banyak `space-y-3`,
tidak unik) dan sulit meneruskan pekerjaan/debug. Kelas semantik memberi nama
stabil pada struktur sehingga:

- Komunikasi antar-dev/agent jadi jelas ("bagian `module-card__description`", bukan "div space-y-3").
- Pekerjaan bisa ditunda/dilanjutkan tanpa kehilangan konteks.
- Modul eksternal memakai kosakata yang sama (kontrak UI konsisten).

## Prinsip inti

1. **Dua lapisan: struktur vs visual.**
   - Lapisan struktur = kelas semantik (target styling & komunikasi).
   - Lapisan visual = utility token Tailwind (`bg-*`, `text-*`, `rounded-*`, `px-*`, dst.).
   - Kelas semantik TIDAK membawa warna/radius/ukuran sendiri (anggap sebagai hook/id).
2. **Token, bukan warna mentah.** Warna/radius tetap lewat design token
   (`app/globals.css`: `bg-surface`, `text-ink`, `border-line`, `text-accent-strong`, dll.)
   — jangan hardcode hex di komponen.
3. **Semantic HTML dulu.** Pilih elemen yang bermakna (`<ul>/<li>`, `<h3>`,
   `<dl>/<dt>/<dd>`, `<article>`, `<time>`) sebelum menentukan class.
4. **Perubahan visual = merubah utility, bukan nama semantik.** Nama semantik
   tidak boleh jadi kode puitis yang berubah-ubah; sekali ditetapkan, stabil.

## Skema penamaan

BEM kebab, blok di-refleksikan dari nama komponen/halaman:

```
.blok                        → komponen (contoh: .module-card, .btn)
.blok__elemen                → bagian dari blok (contoh: .module-card__header)
.blok--modifier              → varian (contoh: .btn--primary, .badge--success)
```

Aturan:

- Dengan `&`/nesting TIDAK dipakai — tulis nama lengkap setiap elemen.
- Kelas semantik ditulis PERTAMA dalam list `className` (didahulukan saat dibaca),
  utility menyusul.
- Untuk komponen `lib/ui.tsx`, nama blok = nama kelas kurva itu:
  `.btn`, `.badge`, `.card`, `.field`, `.input` (= `.field-input`), `.page-header`,
  `.empty-state`, `.error-notice`.
- Untuk markup halaman, nama blok diawali nama konteks :
  `.page`, `.module-list`, `.module-item`. (Hindari `__`-bersarang lebih dari satu level.)

## Pemetaan komponen core (`lib/ui.tsx`)

| Komponen | Blok | Elemen / varian |
|---|---|---|
| `Button` | `.btn` | `.btn--primary` `.btn--secondary` `.btn--ghost` `.btn--danger` |
| `Badge` | `.badge` | `.badge--accent` `.badge--neutral` `.badge--danger` `.badge--success` `.badge--warning` `.badge--info` |
| `Card` | `.card` | `.card__header` `.card__title` `.card__body` |
| `Field` | `.field` | `.field__label` |
| `Input` / `Textarea` | `.input` | — |
| `PageHeader` | `.page-header` | `.page-header__content` `.page-header__title` `.page-header__desc` |
| `EmptyState` | `.empty-state` | — |
| `ErrorNotice` | `.error-notice` | — |
| `Toggler` | `.toggle` | `.toggle__track` `.toggle__thumb` |

## Komponen shell (`app/components/*`)

| Komponen | Blok | Elemen |
|---|---|---|
| `Sidebar` | `.sidebar` | `.sidebar__brand` `.sidebar__locale` `.sidebar__nav` `.sidebar__group` `.sidebar__group-title` `.sidebar__item` `.sidebar__footer` |
| `Topbar` | `.topbar` | `.topbar__title` `.topbar__actions` |
| `UserDropdown` | `.user-dropdown` | `.user-dropdown__trigger` `.user-dropdown__menu` `.user-dropdown__identity` `.user-dropdown__links` |
| `StatCard` | `.stat-card` | `.stat-card__label` `.stat-card__value` `.stat-card__hint` |
| `ModuleWidgets` | `.module-widgets` | `.module-widget` `+` `.module-widget__title` `.module-widget__list` `.module-widget__item` |
| `NotificationButton` | `.notification-button` | — |
| `ThemeToggleButton` | `.theme-toggle` | — |

## Pola markup halaman `modules/` (contoh baku)

```html
<div class="page">
  <page-header class="page-header"></page-header>

  <section class="module-install">
    <form class="module-install__form">…</form>
  </section>

  <ul class="module-list">
    <li class="module-item">
      <div class="module-item__header">
        <div class="module-item__title">
          <h3 class="module-item__name"></h3>
          <span class="badge"></span>
        </div>
        <div class="module-item__actions">
          <button class="btn"></button>
        </div>
      </div>
      <div class="module-item__description"></div>
      <div class="module-item__meta"></div>
    </li>
  </ul>
</div>
```

## Referensi yang sudah semantik (preseden)

- `lib/small-table.tsx` — `small-table`, `small-table-list`, `small-table-detail`,
  `small-table-detail-header`, `small-table-tabs`, `small-table-toolbar`,
  `small-table-pagination`. (Gaya kebab tanpa `__`; saat memakai *helpers* ini
  ikut kelas yang sudah ada, jangan ganti.)
- `lib/master-detail.tsx` — belum diberi kelas semantik; dijadwalkan pada rollout
  `lib/` berikutnya.

## Syarat kelulusan (definition of done)

- Tiap elemen struktural punya kelas semantik yang stabil & unik dalam konteksnya.
- Utility token tetap dipakai untuk visual; nilai token diubah di `globals.css`.
- Tidak ada warna/radius hardcoded (`#…`, `rounded-[…]` tanpa alasan).
- Semantic HTML dipakai bila ada elemen bermakna (`ul/li`, `h3`, `dl`, `nav`).
- `npx tsc --noEmit`, `npm run lint`, dan `npm run build` hijau.

## Komitmen lanjutan

Rollout bertahap (prioritas tinggi→rendah):

- [ ] `app/(app)/modules/page.tsx` — tuntas (contoh baku di atas)
- [x] `lib/ui.tsx` — seluruh komponen core diberi blok semantik
- [x] `app/components/*` — Sidebar, Topbar, UserDropdown, StatCard, ModuleWidgets, NotificationButton, ThemeToggleButton
- [ ] `lib/master-detail.tsx`, `lib/small-table.tsx` — konsistensi blok
- [ ] `app/(app)/*` halaman lainnya + landing (`/`, `api`, `hooks`, `tenants`)
- [ ] `lib/extensions/renderer.tsx` — kontainer area ekstensi

Saat membuat modul baru: pakai kosakata blok di atas (mis. `.module-item__…`),
dan jangan perkenalkan pola penamaan baru tanpa memperbarui dokumen ini.
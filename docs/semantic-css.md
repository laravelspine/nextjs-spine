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

## Halaman & pattern bersama

Kosakata blok lintas halaman (pakai untuk halaman baru alih-alih kelas generik):

| Blok | Pemakaian |
|---|---|
| `.data-table-wrap` / `.data-table` | wrapper overflow + tabel data (tanpa interaksi) |
| `.data-table__head` `.data-table__body` `.data-table__row` `.data-table__head-cell` `.data-table__cell` | struktur tabel |
| `.method-marker--get/post/put/delete` | badge method endpoint (`/api`) |
| `.docs-card` (+ `__title`, `__code`) | kartu info dokumentasi (`/hooks`, `/tenants`) |
| `.modal__backdrop` `__dialog` `__title` `__body` `__actions` | dialog overlay (Sample, SampleTasks) |
| `.form-field` `+ .form-field__actions` | wrapper label+input manual di form |
| `.select` | elemen `<select>` tanpa komponen `Input` |
| `.auth-heading` (+ `__title`, `__desc`) `.auth-footer` | halaman login/register |
| `.profile-card` (+ `__body`, `__avatar`, `__identity`) `.profile-tabs` (+ `__tab`, `--active`, `__modul-tag`) | halaman `/profile` |
| `.settings-tabs` (+ `__tab`, `--active`, `__modul-tag`) | halaman `/settings` |
| `.role-card`/`.permission-card` (+ `__body`, `__info`, `__name`, `__guard`, `__permissions`, `__delete`) | halaman RBAC |
| `.rbac-section` (+ `__header`, `__list`) | kolom Roles/Permissions RBAC |
| `.tag-list` (+ `__item`, `__name`, `__delete`) | halaman `/tags` |
| `.activity-feed` (+ `__item`, `__dot`, `__body`, `__meta`) `.quick-link` (+ `__icon`, `__label`) | dashboard + landing |
| `.dashboard-hero`, `dashboard-stats`, `dashboard-grid`, `dashboard-quick-links`, `dashboard-extension-widgets` | halaman `/dashboard` |
| `.landing`, `landing-hero` (+ `__title`, `__desc`), `landing-grid`, `landing-quick-links`, `landing-welcome`, `feature-card` (+ `__title`, `__desc`, `__link`) | landing `/` |
| `.security-row` (+ `__label`, `__value`) `.profile-sessions__empty` | section Security/Sessions profile |
| `.api-docs`/`.hooks-docs`/`.tenants-docs` (+ `__hero`, `__title`) `.endpoint-group` | halaman dokumentasi |
| `.markas` (+ `__trigger`, `__menu`, `__item`) | menu "Mark as" SampleTasks |
| `.qr-result` (+ `__image`, `__download`) `.pdf-preview` (+ `__download`, `__frame`) | hasil tool |
| `.extension-slot` (+ `--fallback` ringan) | `ExtensionSlot` (`lib/extensions/renderer.tsx`) — kontainer area ekstensi UI |

## Referensi yang sudah semantik (preseden)

- `lib/small-table.tsx` — `small-table`, `small-table-list`, `small-table-detail`,
  `small-table-detail-header`, `small-table-detail-body`, `small-table-tabs`,
  `small-table-toolbar`, `small-table-list-row` (+ `--selected`),
  `small-table-list-col` (+ `--primary`), `small-table-search`,
  `small-table-list-table`, `small-table-list-empty`,
  `small-table-pagination` (+ `__range`, `__controls`, `__prev`, `__next`).
  (Gaya kebab tanpa `__` di blok itu sendiri, `__` untuk elemen dalam; saat
  memakai *helpers* ini ikut kelas yang sudah ada, jangan ganti.)
- `lib/master-detail.tsx` — `master-detail`, `master-detail__list`,
  `master-detail__list-box`, `master-detail__items`, `master-detail__item`,
  `master-detail__item-button` (+ `--active`), `master-detail__item-key`,
  `master-detail__detail`, `master-detail__detail-empty`, `master-detail__panel`,
  `master-detail__header`, `master-detail__tabs`, `master-detail__tab`
  (+ `--active`), `master-detail__body`.
- `lib/master-detail.tsx` — `TabContent` & `statusPill`: `tab-content__table`,
  `tab-content__table-wrap`, `tab-content__thead-row`, `tab-content__tbody`,
  `tab-content__row`, `tab-content__cell`, `tab-content__dl-wrap`,
  `tab-content__dl`, `tab-content__field`, `tab-content__dt`, `tab-content__dd`,
  `tab-content__error`, `tab-content__empty`; `status-pill` (+ `--done`,
  `--progress`, `--pending`, `--neutral`).

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
- [x] `lib/master-detail.tsx`, `lib/small-table.tsx` — konsistensi blok
- [x] `app/(app)/*` halaman lainnya + landing (`/`, `api`, `hooks`, `tenants`)
- [x] `lib/extensions/renderer.tsx` — kontainer area ekstensi

Saat membuat modul baru: pakai kosakata blok di atas (mis. `.module-item__…`),
dan jangan perkenalkan pola penamaan baru tanpa memperbarui dokumen ini.
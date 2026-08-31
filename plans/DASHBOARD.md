# Rencana Dashboard — nextjs-spine

Sumber pola: aplikasi CRM bisnis inspeksi/licensi yang sedang diport —
arsitektur dashboard-nya dipakai sebagai acuan pola, bukan sebagai kode yang disalin.

## Pola dasar (diadopsi dari aplikasi sumber)

Dashboard = **kumpulan widget area (grid)**, tiap area menampung widget yang
**diregistrasi oleh modul** — bukan daftar widget hardcoded di halaman.

```
area: top-12            (lebar penuh)    → statistik cepat
area: middle-left-6     (½)              → widget personal (tugas, kalender, todo)
area: middle-right-6    (½)
area: left-8            (⅔)              → widget besar (overview keuangan + grafik)
area: right-4           (⅓)              → widget samping (event, aktivitas)
area: bottom-left-4 / bottom-middle-4 / bottom-right-4  → aktivitas + chart
```

Aturan:
1. **Widget area** adalah kontrak layout — halaman hanya tahu nama area + urutan.
2. **Widget** didaftarkan oleh modul: `{ id, area, title, icon, component, minWidth }`.
3. Modul yang belum ada → areanya kosong; tidak merusak layout.
4. Urutan widget bisa diatur (drag-drop menyusul, lihat bawah).

## Widget legacy → peta implementasi

| Widget sumber | Data | Status di Spine |
|---|---|---|
| Quick stats (invoice/estimate/lead/project) | per-modul | placeholder sampai modul sales/leads/projects di-port |
| Finance overview + chart | per-modul | placeholder |
| User data (my tasks/projects/tickets) | per-modul | placeholder |
| Todos | resource todo | belum ada endpoint → modul |
| Calendar / upcoming events | modul kalender | belum ada |
| Contracts expiring | modul kontrak | belum ada |
| Leads / projects / tickets charts | per-modul | placeholder |
| **Activity log (timeline)** | **GET /api/v1/activity-logs** | ✅ bisa sekarang |

## Fase implementasi

**Fase 1 — kerangka + widget nyata (sekarang, API yang ada):**
- `app/dashboard/` → halaman `/dashboard` (pindah dari beranda)
- Widget area engine: konfigurasi area → render komponen widget
- Widget `activity-log` (timeline, polling/refresh manual)
- Widget `quick-stats` generic: count activity-logs, files, tags (dari API yang ada)
- Widget welcome (user info) — sudah ada

**Fase 2 — registrasi widget per modul:**
- Saat modul sales/leads/projects/tickets di-port, masing-masing mendaftarkan
  widget-nya (statistik, chart) ke area yang sesuai
- Frontend mendukung konfigurasi widget dinamis dari API/konfigurasi modul

**Nanti — personalisasi:**
- Drag-drop widget antar area + persist urutan (butuh endpoint preferences)

## Arah visual

Konteks: sidebar gelap + konten terang/gelap konsisten (lihat halaman yang
sudah ada). Target tampilan: dashboard modern ala produk SaaS kelas atas —
kartu statistik besar dengan aksen warna, timeline aktivitas yang bersih,
chart minimalis. Acuan gaya (bukan salinan): pola dashboard dari design
systems populer (Vercel/Linear-style): spacing konsisten, border tipis,
angka besar tebal, ikon kecil.

Prinsip: **menarik secara visual tanpa mengurangi fungsionalitas** — setiap
widget legacy punya padanan; yang belum bisa karena modul belum ada
ditampilkan sebagai placeholder yang jelas, bukan dihilangkan diam-diam.

## Status

- [ ] Fase 1: kerangka widget area + `/dashboard` + widget activity-log & quick-stats
- [ ] Fase 2: widget per modul (saat modul di-port)
- [ ] Nanti: drag-drop & persist urutan widget

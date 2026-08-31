# Rencana Dashboard — nextjs-spine

Sumber: `app.ciptamasjaya.co.id/application/views/admin/dashboard/` (legacy Perfex kustom, bisnis inspeksi/licensi).

## Struktur file legacy

```
views/admin/dashboard/
├── dashboard.php        (2.2K)  template utama — layout grid + render widget per container
├── dashboard_js.php     (12K)   JS: drag-drop widget, simpan urutan, refresh
└── widgets/
    ├── calendar.php             kalender (Google Calendar IDs dari controller)
    ├── contracts_expiring.php   kontrak segera habis masa berlaku
    ├── finance_overview.php     (13K, terbesar) overview invoice/estimate + grafik
    ├── leads_chart.php          overview lead per status
    ├── payments_chart.php       rekap pembayaran mingguan
    ├── projects_activity.php    aktivitas project (timeline)
    ├── projects_chart.php       project per status
    ├── tickets_chart.php        tiket menunggu balasan per status/departemen
    ├── todos.php                todo list pribadi (tambah/selesai)
    ├── top_stats.php            (8K) quick stats: invoice, estimate, leads, project
    ├── upcoming_events.php      event minggu ini / minggu depan
    └── user_data.php            (9K) tab: my tasks, my projects, my tickets
```

## Layout grid legacy (dashboard.php)

8 kontainer, widget di-render per container oleh `render_dashboard_widgets()`:

```
top-12            (lebar penuh)   → top_stats
middle-left-6 / middle-right-6   (2 kolom)   → user_data, calendar, todos
left-8 / right-4                 → finance_overview (+ charts), upcoming_events
bottom-left-4 / bottom-middle-4 / bottom-right-4 → projects_activity, charts
```

Hook legacy di sekitar grid: `before_start_render_dashboard_content`,
`after_dashboard_top_container`, `after_dashboard_half_container`,
`after_dashboard`.

Widget bisa di-drag antar container; urutan disimpan (dashboard_js.php).

## Implikasi untuk frontend Spine

- Dashboard Spine memakai layout 2 panel yang sudah ada (sidebar kiri + konten kanan).
- **Yang relevan sekarang** (data tersedia di API Spine saat ini):
  - `top_stats` → butuh endpoint statistik (belum ada — nanti modul sales/leads/projects)
  - `todos` → butuh resource todo (belum ada)
  - `calendar`/`upcoming_events` → butuh modul kalender
- **Yang bisa dibuat sekarang** dengan API yang ada:
  - Widget "Activity Logs" (GET /api/v1/activity-logs) — pengganti projects_activity
  - Widget "Quick stats" versi generic (count activity-logs, files, tags, settings)
  - Placeholder kartu per modul yang belum ada (sales, leads, projects, tickets) — dimunculkan saat modul di-port

## Keputusan

- Jangan port 12 widget sekaligus — widget yang butuh modul (invoice/lead/project/ticket/contract) menunggu modul di-port (konsisten dengan keputusan "module dulu nanti").
- Dashboard fase 1: "Halo user" (sudah ada) + Activity Logs widget + Quick Stats generic + placeholder modul.
- Urutan widget diatur via konfigurasi frontend (bukan drag-drop dulu — YAGNI sampai diminta).

## Status

- [ ] Fase 1: dashboard user + widget activity-logs + quick stats generic
- [ ] Fase 2: widget per modul (saat modul di-port)
- [ ] Nanti: drag-drop widget & persist urutan (butuh API widget-preferences)

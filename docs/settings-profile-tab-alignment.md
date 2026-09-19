# Settings & Profile Tab Alignment — Final Status

## Ringkasan Perubahan

Profile page telah diubah dari **frontend extension system** ke **backend manifest-based**, sesuai dengan pola Settings dan wasnaker.lan.

### Sebelum
| Halaman | Sumber Tab | Mekanisme |
|---------|-----------|-----------|
| Profile | `useExtensions("profile.tabs")` | Frontend extension registry |
| Settings | `/api/v1/settings/schema` | Backend manifest |

### Sesudah
| Halaman | Sumber Tab | Mekanisme |
|---------|-----------|-----------|
| Profile | `useModuleExtensions().profile_tabs` | Backend manifest |
| Settings | `/api/v1/settings/schema` | Backend manifest |

---

## File yang Diubah

### Frontend (`nextjs-spine`)

1. **`lib/module-extensions.ts`**
   - Tambah interface `ProfileTab` (slug, label, icon, href, position, permission, module)
   - Tambah `profile_tabs` ke `ModuleExtensions` interface
   - Update `EMPTY` constant dan `refreshModuleExtensions()`

2. **`app/(app)/profile/page.tsx`**
   - Ganti `useExtensions("profile.tabs")` + `useExtensions("profile.sections")` → `useModuleExtensions()`
   - Hapus semua fungsi komponen inline (ProfileSessions, ProfileSecurity lama)
   - Core tabs tetap hardcoded (Overview, Security, Language) — seperti wasnakar `tabsItems`
   - Module tabs dari manifest (`profile_tabs[]`) ditampilkan sebagai link navigasi
   - Badge "modul" pada tab dari module

### Backend (`laravelspine` repo)

1. **`modules/sampletasks/manifest.php`**
   - Tambah section `profile_tabs` dengan tab Sample Tasks

2. **`modules/boilerplates/Sample/manifest.php`**
   - Tambah section `profile_tabs` dengan tab Sample

### Deployment (`spine.lan`)

1. **`Modules/SampleTasks/manifest.php`**
   - Di-copy dari `laravelspine/modules/sampletasks/manifest.php`

2. **`Modules/Sample/manifest.php`**
   - Di-copy dari `laravelspine/modules/boilerplates/Sample/manifest.php`

---

## Pola Konsisten

Kedua halaman (Profile & Settings) sekarang menggunakan pendekatan yang sama:

- **Core tabs**: Hardcode di frontend (Overview, Security, Language untuk Profile; General, Company, Localization dll untuk Settings)
- **Module tabs**: Berasal dari manifest backend → API endpoint → Frontend render apa adanya
- **Badge "modul"**: Ditampilkan pada tab yang berasal dari module
- **Kontrol di module**: Module hanya perlu tambah section di `manifest.php`, tidak perlu ubah code core

---

## API Endpoints yang Digunakan

| Halaman | Endpoint | Response |
|---------|----------|----------|
| Profile | `GET /api/v1/modules/extensions` | `{ profile_tabs: [...] }` |
| Settings | `GET /api/v1/settings/schema` | `{ tabs: [...] }` |

---

## Catatan

- Area extension registry `"profile.tabs"` dan `"profile.sections"` masih terdaftar di `lib/extensions/types.ts` namun tidak lagi digunakan oleh profile page. Bisa dihapus nanti jika tidak ada module lain yang menggunakannya.
- Frontend extension registry masih dipakai untuk area lain: `navigation.main`, `navigation.profile`, `settings.tabs`, `dashboard.widgets`.

---

## Commit & Deployment Status

| Repo | Commit | Hash | Status |
|------|--------|------|--------|
| `nextjs-spine` | feat: 6 entity events to hooks menu | `b9705f1` | ✅ pushed |
| `nextjs-spine` | refactor: Profile page manifest-based | `563a04e` | ✅ pushed |
| `laravelspine` (local) | Add profile_tabs to Sample & SampleTasks manifest | local | ✅ synced to spine.lan |

**Build & Restart:**
- `npm run build` — ✅ success
- `sudo systemctl restart nextjs-spine` — ✅ active on port 3003
- spine.lan manifest files copied — ✅ verified via API

**API Verification:**
```json
GET /api/v1/modules/extensions → {
  "profile_tabs": [
    {"slug":"sample-tasks","label":"Sample Tasks","icon":"✅","href":"/sample-tasks","position":30,"module":"SampleTasks"},
    {"slug":"sample","label":"Sample","icon":"📦","href":"/sample","position":51,"module":"Sample"}
  ]
}
```
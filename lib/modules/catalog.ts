import type { SpineModule } from "./types";

/**
 * Katalog module frontend yang ikut di-boot bersama core (bootModules).
 *
 * Modul demo "Referrals" (folder lib/modules/demo-referrals/) SEMENTARA
 * TIDAK dimasukkan — belum di-commit (sedang dibahas). Untuk mengaktifkannya
 * lagi, tambahkan SATU baris di bawah:
 *
 *   import { referralsModule } from "./demo-referrals/module";
 *   export const modules: SpineModule[] = [referralsModule];
 *
 * (Pastikan folder demo-referrals/ ikut di-commit saat baris ini dipasang,
 *  supaya tree buildable bagi yang menarik repo.)
 */
export const modules: SpineModule[] = [];
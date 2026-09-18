/**
 * Permission resolver frontend — HANYA untuk show/hide UI (UX), bukan
 * security boundary. Otorisasi tetap di backend Laravel. Permission yang
 * belum ada di daftar = tersembunyi; kosong = selalu tampil.
 */
let granted = new Set<string>();

export function setGrantedPermissions(list: string[]) {
  granted = new Set(list);
}

export function hasPermission(permission?: string): boolean {
  if (!permission) return true;
  return granted.has(permission) || granted.has("*");
}
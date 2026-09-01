"use client";

/**
 * NotificationButton — placeholder bel notifikasi.
 * ponytail: tanpa data API; isi saat Reverb/broadcast dipakai (event NotificationSent).
 */
export function NotificationButton() {
  return (
    <button
      type="button"
      aria-label="Notifikasi"
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-line-soft bg-surface-raised text-ink-muted transition-colors hover:text-ink"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    </button>
  );
}

"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import type { ModuleWidget } from "./module-extensions";
import { WidgetBody } from "./dashboard-widget-body";
import { cx } from "@/lib/ui";

/** Grip ikon (drag handle) — dua kolom 6 titik. */
function GripIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="currentColor"
    >
      <circle cx="3.5" cy="3.5" r="1.4" />
      <circle cx="10.5" cy="3.5" r="1.4" />
      <circle cx="3.5" cy="10.5" r="1.4" />
      <circle cx="10.5" cy="10.5" r="1.4" />
    </svg>
  );
}

/** Ikon mata (tampil). */
function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** Ikon mata coret (sembunyi). */
function EyeOffIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

interface Props {
  widget: ModuleWidget;
  /** Posisi dalam daftar area (SEMUA id — visible & tersembunyi). */
  index: number;
  area: string;
  visible: boolean;
  onToggleVisibility: (id: string) => void;
}

/**
 * Kartu widget = item sortable. Drag via grip di header (handleRef).
 * Widget tersembunyi tetap dirender (hidden) supaya POSISINYA di layout
 * tidak hilang — paritas legacy (widget hidden tetap dalam sortable order).
 */
export function DashboardWidgetCard({
  widget,
  index,
  area,
  visible,
  onToggleVisibility,
}: Props) {
  const { ref, handleRef, isDragging } = useSortable({
    id: widget.id,
    index,
    group: area,
    type: "item",
    accept: "item",
  });

  return (
    <article
      ref={ref}
      data-widget-id={widget.id}
      hidden={!visible}
      className={cx(
        "rounded-xl border border-line-soft bg-surface-raised shadow-card",
        isDragging && "z-10 opacity-70"
      )}
    >
      <header className="flex items-center gap-2 border-b border-line-soft px-4 py-2.5">
        <button
          ref={handleRef}
          type="button"
          aria-label={`Drag ${widget.title}`}
          className="cursor-grab touch-none rounded p-0.5 text-ink-faint hover:text-ink-muted active:cursor-grabbing"
        >
          <GripIcon />
        </button>
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
          {widget.title}
        </h2>
        <button
          type="button"
          aria-label={visible ? `Sembunyikan ${widget.title}` : `Tampilkan ${widget.title}`}
          title={visible ? "Sembunyikan widget" : "Tampilkan widget"}
          onClick={() => onToggleVisibility(widget.id)}
          className="rounded p-1 text-ink-faint transition-colors hover:bg-surface-overlay hover:text-ink-muted"
        >
          {visible ? <EyeIcon /> : <EyeOffIcon />}
        </button>
      </header>
      <div className="px-4 py-3">
        <WidgetBody widget={widget} />
      </div>
    </article>
  );
}

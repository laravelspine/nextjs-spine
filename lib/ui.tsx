"use client";

/**
 * Komponen UI dasar Spine — dibangun di atas design tokens (globals.css).
 * Semua komponen hanya memakai token (surface/line/ink/accent), bukan
 * warna hardcoded.
 */

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ---------- Button ---------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-accent-strong",
  secondary: "bg-surface-overlay text-ink hover:bg-line",
  ghost: "text-ink-muted hover:text-ink hover:bg-surface-overlay",
  danger: "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button className={cx(buttonBase, buttonVariants[variant], className)} {...props} />
  );
}

/* ---------- Input / Textarea ---------- */

const fieldBase =
  "w-full rounded-md border border-line bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-accent";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(fieldBase, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(fieldBase, className)} {...props} />;
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">{label}</label>
      {children}
    </div>
  );
}

/* ---------- Card ---------- */

export function Card({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-xl border border-line-soft bg-surface-raised shadow-card",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-3">
          {title && <h3 className="text-sm font-semibold text-ink">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ---------- Badge ---------- */

type BadgeTone = "accent" | "neutral" | "danger" | "success" | "warning" | "info";

const badgeTones: Record<BadgeTone, string> = {
  accent: "bg-accent-soft text-accent-strong",
  neutral: "bg-surface-overlay text-ink-muted",
  danger: "bg-danger/10 text-danger",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        badgeTones[tone]
      )}
    >
      {children}
    </span>
  );
}

/* ---------- PageHeader ---------- */

export function PageHeader({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {desc && <p className="mt-1 text-sm text-ink-muted">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- EmptyState ---------- */

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line-soft px-6 py-12 text-center text-sm text-ink-faint">
      {message}
    </div>
  );
}

/* ---------- ErrorNotice ---------- */

export function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
      {message}
    </div>
  );
}

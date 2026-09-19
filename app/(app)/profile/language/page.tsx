"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n-context";
import { Card } from "@/lib/ui";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "id", label: "Indonesia" },
  { value: "ko", label: "한국어" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日本語" },
] as const;

export default function ProfileLanguagePage() {
  const { locale, setLocale } = useI18n();
  const [current, setCurrent] = useState(locale);
  const [notice, setNotice] = useState<string | null>(null);

  function pick(code: (typeof LANGUAGES)[number]["value"]) {
    if (code === current) return;
    setLocale(code);
    setCurrent(code);
    setNotice("Bahasa berhasil diubah.");
  }

  return (
    <Card title="Bahasa">
      <div className="space-y-3">
        {notice && (
          <p className="rounded-md bg-accent-soft px-3 py-2 text-sm text-accent-strong">
            {notice}
          </p>
        )}
        <p className="text-sm text-ink-muted">
          Pilih bahasa yang Anda inginkan untuk antarmuka.
        </p>
        <div className="space-y-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              type="button"
              onClick={() => pick(lang.value)}
              className={
                "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors " +
                (current === lang.value
                  ? "border-accent/40 bg-accent-soft text-accent-strong"
                  : "border-line-soft bg-surface-raised text-ink-muted hover:text-ink")
              }
            >
              <span>{lang.label}</span>
              {current === lang.value && <span>✓</span>}
            </button>
          ))}
        </div>
        <p className="text-xs text-ink-faint">
          Preferensi bahasa disimpan secara lokal di browser.
        </p>
      </div>
    </Card>
  );
}

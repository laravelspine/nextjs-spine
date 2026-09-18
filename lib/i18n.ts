/**
 * i18n — simple JSON-based translator for Spine Next.js frontend.
 *
 * Usage:
 *   import { t } from "@/lib/i18n";
 *   t("nav.home")  // → "Home" (or localized)
 *
 * Default language: english (en).
 * Languages supported: en, id, ko, zh, ja
 */

import en from "@/locales/en.json";
import id from "@/locales/id.json";
import ko from "@/locales/ko.json";
import zh from "@/locales/zh.json";
import ja from "@/locales/ja.json";

export const locales = ["en", "id", "ko", "zh", "ja"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  id: "Indonesia",
  ko: "한국어",
  zh: "中文",
  ja: "日本語",
};

type TranslationDict = typeof en;

const translations: Record<Locale, TranslationDict> = {
  en,
  id,
  ko,
  zh,
  ja,
};

let currentLocale: Locale = "en";

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  if (typeof window !== "undefined") {
    localStorage.setItem("spine_locale", locale);
  }
}

export function getLocale(): Locale {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("spine_locale") as Locale | null;
    if (stored && locales.includes(stored)) {
      return stored;
    }
  }
  return currentLocale;
}

export function t(key: string, params?: Record<string, string>): string {
  const dict = translations[currentLocale];
  if (!dict) return key;

  const keys = key.split(".");
  let value: unknown = dict;

  for (const k of keys) {
    if (value && typeof value === "object" && k in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }

  if (typeof value !== "string") return key;

  let result = value;

  if (params) {
    for (const [placeholder, replacement] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${placeholder}\\}`, "g"), replacement);
    }
  }

  return result;
}

import type { Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n";
import type { Label } from "./types";

/**
 * i18n minimal — modul membawa kamus namespace sendiri (mis. "referrals"),
 * core hanya resolve label. Bahasa UI repo ini: Indonesia (default),
 * tetapi kontrak tidak mengunci bahasa — module boleh bawa bahasa lain.
 */
const dict = new Map<string, string>();

/** Tambahkan satu blok terjemahan: messages key → string di namespace `ns`. */
export function addTranslations(
  ns: string,
  messages: Record<string, string>,
  locale: Locale = "en"
) {
  for (const [key, value] of Object.entries(messages)) {
    dict.set(`${locale}.${ns}.${key}`, value);
  }
}

/** Resolve Label → string tampil. Fallback: key, lalu string mentah. */
export function t(label: Label): string {
  const locale = getLocale();
  // dukung juga string dot-notation (mis. "module.sample.tabs.sample")
  if (typeof label === "string") {
    return dict.get(`${locale}.${label}`) ?? dict.get(`en.${label}`) ?? label;
  }
  return (
    dict.get(`${locale}.${label.namespace}.${label.key}`) ??
    dict.get(`en.${label.namespace}.${label.key}`) ??
    label.key
  );
}
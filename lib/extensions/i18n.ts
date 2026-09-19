import type { Label } from "./types";

/**
 * i18n minimal — modul membawa kamus namespace sendiri (mis. "referrals"),
 * core hanya resolve label. Bahasa UI repo ini: Indonesia (default),
 * tetapi kontrak tidak mengunci bahasa — module boleh bawa bahasa lain.
 */
const dict = new Map<string, string>();

/** Tambahkan satu blok terjemahan: messages key → string di namespace `ns`. */
export function addTranslations(ns: string, messages: Record<string, string>) {
  for (const [key, value] of Object.entries(messages)) {
    dict.set(`${ns}.${key}`, value);
  }
}

/** Resolve Label → string tampil. Fallback: key, lalu string mentah. */
export function t(label: Label): string {
  // dukung juga string dot-notation (mis. "module.sample.tabs.sample")
  if (typeof label === "string") {
    return dict.get(label) ?? label;
  }
  return dict.get(`${label.namespace}.${label.key}`) ?? label.key;
}
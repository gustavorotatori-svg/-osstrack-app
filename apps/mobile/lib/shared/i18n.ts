/* ------------------------------------------------------------------ */
/*  Shared i18n for OssTrack (web + mobile)                           */
/*  Web already has its own i18n.ts — this is for mobile consumption  */
/* ------------------------------------------------------------------ */

export type Locale = "pt" | "en" | "es"

const allMessages: Record<string, any> = {}

function getNested(obj: any, path: string): string | null {
  const keys = path.split(".")
  let current = obj
  for (const key of keys) {
    if (current == null) return null
    current = current[key]
  }
  return typeof current === "string" ? current : null
}

export function loadMessages(locale: Locale, messages: any) {
  allMessages[locale] = messages
}

export function t(locale: Locale, key: string): string {
  const msg = allMessages[locale]
  if (!msg) return key
  return getNested(msg, key) || getNested(allMessages["pt"], key) || key
}

export const localeLabels: Record<Locale, string> = {
  pt: "PT",
  en: "EN",
  es: "ES",
}

export const localeNames: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
}

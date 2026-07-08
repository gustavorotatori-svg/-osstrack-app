import pt from "../../messages/pt.json"
import en from "../../messages/en.json"
import es from "../../messages/es.json"
import fr from "../../messages/fr.json"
import de from "../../messages/de.json"
import nl from "../../messages/nl.json"
import sv from "../../messages/sv.json"
import ja from "../../messages/ja.json"
import ar from "../../messages/ar.json"

const allMessages: Record<string, any> = { pt, en, es, fr, de, nl, sv, ja, ar }

export type Locale = "pt" | "en" | "es" | "fr" | "de" | "nl" | "sv" | "ja" | "ar"

export function getMessages(locale: Locale) {
  return allMessages[locale] || allMessages["pt"]
}

function getNested(obj: any, path: string): string {
  const keys = path.split(".")
  let current = obj
  for (const key of keys) {
    if (current == null) return path
    current = current[key]
  }
  return typeof current === "string" ? current : path
}

export function t(locale: Locale, key: string): string {
  return getNested(allMessages[locale], key) || getNested(allMessages["pt"], key) || key
}

export function useTranslations(locale: Locale) {
  return (key: string) => t(locale, key)
}

export const localeLabels: Record<Locale, string> = {
  pt: "PT",
  en: "EN",
  es: "ES",
  fr: "FR",
  de: "DE",
  nl: "NL",
  sv: "SV",
  ja: "JP",
  ar: "AR",
}

export const localeNames: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  nl: "Nederlands",
  sv: "Svenska",
  ja: "日本語",
  ar: "العربية",
}

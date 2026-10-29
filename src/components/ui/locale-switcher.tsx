"use client"

import { useLocale } from "@/components/layout/providers"

const locales = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "fr", label: "FR" },
  { code: "de", label: "DE" },
  { code: "nl", label: "NL" },
  { code: "sv", label: "SV" },
  { code: "ja", label: "JP" },
  { code: "ar", label: "AR" },
  { code: "zh", label: "ZH" },
  { code: "hi", label: "HI" },
  { code: "it", label: "IT" },
  { code: "ru", label: "RU" },
  { code: "ko", label: "KO" },
] as const

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <select
      aria-label="Idioma / Language"
      value={locale}
      onChange={(event) => setLocale(event.target.value as typeof locale)}
      className="rounded-lg border border-[var(--dark-border)] bg-[var(--bg)] px-2 py-2 text-xs font-semibold text-[var(--text)] min-h-10 shrink-0"
    >
      {locales.map((language) => (
        <option key={language.code} value={language.code}>{language.label}</option>
      ))}
    </select>
  )
}

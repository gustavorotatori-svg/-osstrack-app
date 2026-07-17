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
    <div className="flex items-center gap-0.5 flex-wrap">
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => setLocale(l.code as any)}
          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all min-h-[32px] ${
            locale === l.code
              ? "text-[var(--gold)] bg-[rgba(201,168,76,0.1)]"
              : "text-[var(--gray)] hover:text-[var(--white-muted)]"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}

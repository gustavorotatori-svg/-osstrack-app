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
] as const

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => setLocale(l.code as any)}
          className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition-all ${
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

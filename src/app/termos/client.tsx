"use client"

import Link from "next/link"
import { useT } from "@/lib/use-t"
import { ArrowLeft } from "lucide-react"

export function TermosView() {
  const t = useT("pagTermos")

  return (
    <div className="pt-28 pb-20 px-5">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>
          <ArrowLeft className="w-3.5 h-3.5" /> {t("voltaInicio")}
        </Link>
        <div className="text-center mb-12">
          <div className="w-14 h-14 gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight mb-3">{t("titulo")}</h1>
          <p className="text-[var(--white-muted)] leading-relaxed max-w-lg mx-auto">
            {t("subtitulo")}
          </p>
          <div className="text-xs text-[var(--gray)] mt-2">{t("atualizado")}</div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-6 md:p-8">
            <h2 className="text-base font-bold mb-3 text-[var(--gold)]">{t("s1t")}</h2>
            <p className="text-sm text-[var(--white-muted)] leading-relaxed">
              {t("s1bAntes")} <Link href="/lgpd" className="text-[var(--gold)] font-semibold hover:underline">{t("politicaPrivacidade")}</Link>
              {t("s1bDepois")}
            </p>
          </div>

          <div className="glass-card p-6 md:p-8">
            <h2 className="text-base font-bold mb-3 text-[var(--gold)]">{t("s2t")}</h2>
            <p className="text-sm text-[var(--white-muted)] leading-relaxed">
              {t("s2b")}
            </p>
          </div>

          <div className="glass-card p-6 md:p-8">
            <h2 className="text-base font-bold mb-3 text-[var(--gold)]">{t("s3t")}</h2>
            <p className="text-sm text-[var(--white-muted)] leading-relaxed">
              {t("s3b")}
            </p>
          </div>

          <div className="glass-card p-6 md:p-8">
            <h2 className="text-base font-bold mb-3 text-[var(--gold)]">{t("s4t")}</h2>
            <p className="text-sm text-[var(--white-muted)] leading-relaxed">
              {t("s4bAntes")} <Link href="/lgpd" className="text-[var(--gold)] font-semibold hover:underline">{t("politicaPrivacidade")}</Link>
              {t("s4bDepois")}
            </p>
          </div>

          <div className="glass-card p-6 md:p-8">
            <h2 className="text-base font-bold mb-3 text-[var(--gold)]">{t("s5t")}</h2>
            <p className="text-sm text-[var(--white-muted)] leading-relaxed">
              {t("s5b")}
            </p>
          </div>

          <div className="glass-card p-6 md:p-8">
            <h2 className="text-base font-bold mb-3 text-[var(--gold)]">{t("s6t")}</h2>
            <p className="text-sm text-[var(--white-muted)] leading-relaxed">
              {t("s6b")}
            </p>
          </div>

          <div className="glass-card p-6 md:p-8">
            <h2 className="text-base font-bold mb-3" style={{ color: "var(--gold)" }}>{t("s7t")}</h2>
            <p className="text-sm text-[var(--white-muted)] leading-relaxed">
              {t("s7b")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

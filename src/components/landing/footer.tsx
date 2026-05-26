"use client"

import { useT } from "@/lib/use-t"

export function Footer() {
  const t = useT("footer")

  const tNav = useT("nav")

  const tFrases = useT("frases")

  return (
    <footer className="py-16 px-5 border-t border-[var(--dark-border)] text-center relative">
      <div className="max-w-4xl mx-auto">
        <div className="w-12 h-12 gradient-gold rounded-2xl flex items-center justify-center text-lg text-black mx-auto mb-4">🥋</div>
        <div className="text-xl font-extrabold mb-6">OssTrack</div>
        <div className="flex justify-center gap-8 flex-wrap mb-8">
          <a href="#recursos" className="text-sm text-[var(--white-muted)] hover:text-[var(--gold)] transition-colors duration-200">
            {tNav("recursos")}
          </a>
          <a href="#funciona" className="text-sm text-[var(--white-muted)] hover:text-[var(--gold)] transition-colors duration-200">
            {tNav("comoFunciona")}
          </a>
          <a href="#planos" className="text-sm text-[var(--white-muted)] hover:text-[var(--gold)] transition-colors duration-200">
            {tNav("planos")}
          </a>
          <a href="#" className="text-sm text-[var(--white-muted)] hover:text-[var(--gold)] transition-colors duration-200">
            Suporte
          </a>
          <a href="#" className="text-sm text-[var(--white-muted)] hover:text-[var(--gold)] transition-colors duration-200">
            {t("termos")}
          </a>
          <a href="#" className="text-sm text-[var(--white-muted)] hover:text-[var(--gold)] transition-colors duration-200">
            {t("privacidade")}
          </a>
        </div>
        <div className="h-[1px] w-24 mx-auto bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.3)] to-transparent mb-6" />
        <div className="text-xs text-[var(--gray)] leading-relaxed">
          <p className="font-semibold text-[var(--white-muted)] mb-1">&ldquo;{tFrases("0")}&rdquo;</p>
          <p>© 2026 OssTrack. {t("direitos")}</p>
        </div>
      </div>
    </footer>
  )
}

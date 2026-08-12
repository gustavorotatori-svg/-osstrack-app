"use client"

import Link from "next/link"
import { useT } from "@/lib/use-t"

import { MessageCircle } from "lucide-react"

export function Footer() {
  const t = useT("footer")
  const tNav = useT("nav")
  const tFrases = useT("frases")

  const socialLinks = [
    { href: "https://wa.me/5511942221028", label: "WhatsApp", icon: MessageCircle },
  ]

  return (
    <footer className="pt-16 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8 px-5 border-t border-[var(--dark-border)] relative">
      <div className="max-w-6xl mx-auto">
        {/* CTA */}
        <div className="relative mb-14 overflow-hidden rounded-2xl p-8 md:p-10 text-center"
          style={{ background: "linear-gradient(160deg, var(--gold-dim) 0%, var(--bg) 50%, var(--gold-dim) 100%)", border: "1px solid var(--border)" }}>
          <div className="absolute top-[-80px] right-[-80px] w-40 h-40 bg-[var(--gold)]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-60px] left-[-60px] w-32 h-32 bg-[var(--gold)]/3 rounded-full blur-3xl" />
          <div className="relative">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-3"
              style={{ background: "rgba(212,168,71,0.1)", color: "var(--gold)", border: "1px solid rgba(212,168,71,0.2)" }}>
              100% gratuito
            </span>
            <h3 className="text-xl md:text-2xl font-extrabold tracking-tight mb-2" style={{ color: "var(--text)" }}>
              Pronto para transformar sua academia?
            </h3>
            <p className="text-sm mb-5 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
               Junte-se a centenas de academias que já usam o OssTrack. Gratuito. Sem limites. Sem pegadinha.
            </p>
            <Link
              href="/cadastro"
              className="btn-gold px-8 py-3 text-sm font-bold inline-flex items-center gap-2 hover:scale-105 transition-transform active:scale-95"
            >
              Criar conta grátis
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8 md:gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-base tracking-tight mb-1">
              <span className="w-8 h-8 gradient-gold rounded-xl flex items-center justify-center animate-float" />
              <span>OssTrack</span>
            </Link>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)] mb-4">
              The Jiu Jitsu Revolution
            </p>
            <p className="text-sm text-[var(--white-muted)] leading-relaxed max-w-xs">
              {t("descricao")}
            </p>
          </div>

          {/* Navegação */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] mb-4">{t("plataforma")}</h4>
            <ul className="space-y-3">
              <li><Link href="/#recursos" className="text-sm text-[var(--white-muted)] hover:text-[var(--gold)] transition-colors">{tNav("recursos")}</Link></li>
              <li><Link href="/#funciona" className="text-sm text-[var(--white-muted)] hover:text-[var(--gold)] transition-colors">{tNav("comoFunciona")}</Link></li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] mb-4">{t("suporte")}</h4>
            <ul className="space-y-3">
              <li><Link href="/ajuda" className="text-sm text-[var(--white-muted)] hover:text-[var(--gold)] transition-colors">{t("ajuda")}</Link></li>
              <li><Link href="/ajuda#contato-form" className="text-sm text-[var(--white-muted)] hover:text-[var(--gold)] transition-colors">{t("faleConosco")}</Link></li>
              <li><a href="https://wa.me/5511942221028" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--white-muted)] hover:text-[var(--gold)] transition-colors">{t("whatsapp")}</a></li>
              <li><a href="mailto:passador@osstrack.com" className="text-sm text-[var(--white-muted)] hover:text-[var(--gold)] transition-colors">passador@osstrack.com</a></li>
            </ul>
          </div>

          {/* Legal + Social */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] mb-4">{t("legal")}</h4>
            <ul className="space-y-3 mb-6">
              <li><Link href="/lgpd" className="text-sm text-[var(--white-muted)] hover:text-[var(--gold)] transition-colors">{t("privacidade")}</Link></li>
              <li><Link href="/termos" className="text-sm text-[var(--white-muted)] hover:text-[var(--gold)] transition-colors">{t("termos")}</Link></li>
            </ul>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] mb-3">{t("redesSociais")}</h4>
            <div className="flex gap-3">
              {socialLinks.map((s) => {
                const Icon = s.icon
                return (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-[var(--dark-card)] border border-[var(--dark-border)] flex items-center justify-center text-sm hover:border-[var(--gold)] hover:bg-[rgba(201,168,76,0.08)] transition-all active:scale-[0.97]"
                    title={s.label}>
                    <Icon className="w-4 h-4 text-[var(--white-muted)]" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(201,168,76,0.15)] to-transparent mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="text-xs text-[var(--gray)]">
            <p>&ldquo;{tFrases("0")}&rdquo;</p>
          </div>
          <div className="text-xs text-[var(--gray)]">
            © {new Date().getFullYear()} OssTrack. {t("direitos")}
          </div>
        </div>
      </div>
    </footer>
  )
}

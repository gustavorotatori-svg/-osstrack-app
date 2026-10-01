"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useT } from "@/lib/use-t"
import { HelpIcon, MailIcon } from "@/components/ui/icons"
import { enviarContato } from "./actions"

type FaqItem = { q: string; r: string }

export function AjudaView() {
  const t = useT("pagAjuda")

  const faqItems: FaqItem[] = [
    { q: t("faq1q"), r: t("faq1r") },
    { q: t("faq2q"), r: t("faq2r") },
    { q: t("faq3q"), r: t("faq3r") },
    { q: t("faq4q"), r: t("faq4r") },
    { q: t("faq5q"), r: t("faq5r") },
    { q: t("faq6q"), r: t("faq6r") },
    { q: t("faq7q"), r: t("faq7r") },
    { q: t("faq8q"), r: t("faq8r") },
  ]

  return (
    <div className="pt-28 pb-20 px-5">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>
          <ArrowLeft className="w-3.5 h-3.5" /> {t("voltaInicio")}
        </Link>
        <div className="text-center mb-12">
          <div className="w-14 h-14 gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-4"><HelpIcon className="w-6 h-6 text-black" /></div>
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight mb-3">{t("titulo")}</h1>
          <p className="text-[var(--white-muted)] leading-relaxed max-w-lg mx-auto">
            {t("subtitulo")}
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <HelpIcon className="w-5 h-5 text-[var(--gold)]" /> {t("faqTitulo")}
          </h2>
          <AjudaClient items={faqItems} />
        </div>

        <div>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <MailIcon className="w-5 h-5 text-[var(--gold)]" /> {t("faleConosco")}
          </h2>
          <div className="glass-card p-6 md:p-8">
            <p className="text-sm text-[var(--white-muted)] mb-6">
              {t("contatoIntro")}
            </p>
            <ContatoForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export function AjudaClient({ items }: { items: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = openIdx === i
        return (
          <div key={i} className="glass-card overflow-hidden transition-all duration-300">
            <button
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full flex items-center justify-between p-4 md:p-5 text-left active:scale-[0.97] transition-transform"
            >
              <span className="text-sm font-semibold pr-4">{item.q}</span>
              <span className={`shrink-0 text-[var(--gold)] transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
            </button>
            <div className={`transition-all duration-300 overflow-hidden ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="px-4 md:px-5 pb-4 md:pb-5">
                <p className="text-sm text-[var(--white-muted)] leading-relaxed">{item.r}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ContatoForm() {
  const t = useT("pagAjuda")

  return (
    <form action={enviarContato} className="space-y-4" id="contato-form">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nome" className="block text-xs font-semibold text-[var(--white-muted)] mb-1.5">{t("nomeLabel")}</label>
          <input id="nome" name="nome" type="text" required placeholder={t("nomePlaceholder")}
            className="input-field" />
        </div>
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-[var(--white-muted)] mb-1.5">{t("emailLabel")}</label>
          <input id="email" name="email" type="email" required placeholder={t("emailPlaceholder")}
            className="input-field" />
        </div>
      </div>
      <div>
        <label htmlFor="mensagem" className="block text-xs font-semibold text-[var(--white-muted)] mb-1.5">{t("mensagemLabel")}</label>
        <textarea id="mensagem" name="mensagem" required rows={5} placeholder={t("mensagemPlaceholder")}
          className="input-field resize-none" />
      </div>
      <label className="flex items-start gap-2.5 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        <input type="checkbox" name="consentimento" required className="mt-0.5 shrink-0 accent-[var(--gold)]" />
        <span>
          {t("consentimentoAntes")} <Link href="/lgpd" className="underline font-semibold" style={{ color: "var(--gold)" }}>{t("politicaPrivacidade")}</Link>{t("consentimentoDepois")}
        </span>
      </label>
      <button type="submit"
        className="btn-gold px-8 py-3.5 text-sm font-bold w-full md:w-auto active:scale-[0.97]">
        {t("enviarMensagem")}
      </button>
    </form>
  )
}

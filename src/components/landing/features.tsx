"use client"

import { useTranslations } from "next-intl"

export function Features() {
  const t = useTranslations("features")

  const features = [
    { icon: "📍", titleKey: "checkin", descKey: "checkinDesc" },
    { icon: "📈", titleKey: "evolucao", descKey: "evolucaoDesc" },
    { icon: "🏆", titleKey: "gamificacao", descKey: "gamificacaoDesc" },
    { icon: "📊", titleKey: "financas", descKey: "financasDesc" },
    { icon: "📱", titleKey: "whatsapp", descKey: "whatsappDesc" },
    { icon: "👨‍🏫", titleKey: "graduacao", descKey: "graduacaoDesc" },
  ]

  return (
    <section id="recursos" className="py-24 px-5 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(201,168,76,0.02)] to-transparent" />
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] rounded-full text-xs text-[var(--gold)] font-semibold uppercase tracking-widest mb-5">
            Por trás do código
          </span>
          <h2 className="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold tracking-tight mb-4">
            {t("titulo")}
          </h2>
          <p className="text-[var(--white-muted)] leading-relaxed">
            {t("subtitulo")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={f.titleKey}
              className="group bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-7 transition-all duration-300 hover:border-[rgba(201,168,76,0.25)] hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[rgba(201,168,76,0.12)] to-[rgba(201,168,76,0.04)] border border-[rgba(201,168,76,0.15)] flex items-center justify-center text-lg mb-4 group-hover:border-[rgba(201,168,76,0.3)] transition-all">
                {f.icon}
              </div>
              <h3 className="text-base font-bold mb-2.5">{t(f.titleKey)}</h3>
              <p className="text-sm text-[var(--white-muted)] leading-relaxed">{t(f.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

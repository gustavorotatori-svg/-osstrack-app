"use client"

import Link from "next/link"
import { useT } from "@/lib/use-t"

export function Plans() {
  const t = useT("planos")

  const plans = [
    {
      nameKey: "gratis",
      priceKey: "gratisPreco",
      period: null,
      featured: false,
      descKey: "gratisDesc",
      featuresCount: 6,
      ctaKey: "gratisCta",
      href: "/cadastro",
      tag: null,
    },
    {
      nameKey: "premium",
      priceKey: "premiumPreco",
      periodKey: "premiumPeriodo",
      featured: true,
      descKey: "premiumDesc",
      featuresCount: 5,
      ctaKey: "premiumCta",
      href: "/login",
      tagKey: "maisPopulares",
    },
    {
      nameKey: "academia",
      priceKey: "academiaPreco",
      period: null,
      featured: false,
      descKey: "academiaDesc",
      featuresCount: 7,
      ctaKey: "academiaCta",
      href: "/cadastro",
      tag: null,
    },
  ]

  return (
    <section id="planos" className="py-24 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="inline-block px-4 py-1.5 bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] rounded-full text-xs text-[var(--gold)] font-semibold uppercase tracking-widest mb-5">
            {t("badge")}
          </span>
          <h2 className="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold tracking-tight mb-4">
            {t("titulo")}
          </h2>
          <p className="text-[var(--white-muted)] leading-relaxed">
            {t("subtitulo")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start max-w-5xl mx-auto">
          {plans.map((p, i) => (
            <div
              key={p.nameKey}
              className={`rounded-2xl p-8 transition-all duration-300 animate-fade-in-up relative ${
                p.featured
                  ? "gradient-gold-border bg-[var(--dark-card)] scale-[1.02] md:scale-105"
                  : "bg-[var(--dark-card)] border border-[var(--dark-border)] hover:border-[rgba(201,168,76,0.2)]"
              }`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {p.tagKey && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 gradient-gold rounded-full text-[11px] font-bold text-black tracking-wider shadow-lg">
                  {t(p.tagKey)}
                </div>
              )}
              <div className="text-lg font-bold mb-1.5">{t(p.nameKey)}</div>
              <div className="text-sm text-[var(--white-muted)] mb-6">{t(p.descKey)}</div>
              <div className="text-[2.75rem] font-black tracking-tight mb-6">
                {t(p.priceKey)} <span className="text-sm font-normal text-[var(--white-muted)]">{p.periodKey ? t(p.periodKey) : ""}</span>
              </div>
              <ul className="space-y-3.5 mb-8">
                {Array.from({ length: p.featuresCount }).map((_, idx) => (
                  <li key={idx} className="text-sm flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-500 text-xs shrink-0">✓</span>
                    {p.nameKey === "gratis" && t(`gratisFeatures.${idx}`)}
                    {p.nameKey === "premium" && t(`premiumFeatures.${idx}`)}
                    {p.nameKey === "academia" && t(`academiaFeatures.${idx}`)}
                  </li>
                ))}
              </ul>
              <Link
                href={p.href}
                className={`block text-center py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                  p.featured
                    ? "btn-gold"
                    : "border border-[var(--dark-border)] text-white hover:border-[var(--gold)]"
                }`}
              >
                {t(p.ctaKey)}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

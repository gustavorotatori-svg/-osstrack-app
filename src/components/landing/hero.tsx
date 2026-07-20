"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useT } from "@/lib/use-t"
import { useEffect, useState } from "react"

export function Hero({ stats }: { stats?: { academias: number; alunos: number; retencao: number } }) {
  const t = useT("hero")
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  function formatStat(n: number) {
    if (n >= 10000) return `${(n / 1000).toFixed(0)}K+`
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}K+`
    return String(n)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-5 overflow-hidden" style={{ background: "var(--bg)" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, var(--gold-dim) 0%, transparent 60%)" }} />

      {/* Jiu-Jitsu belts background — 8 faixas reais animando de cima e de baixo */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {[
          { bg: "linear-gradient(90deg, transparent 0%, #e5e5e522 10%, #e5e5e544 50%, #e5e5e522 90%, transparent 100%)", label: "branca" },
          { bg: "linear-gradient(90deg, transparent 0%, #3b82f622 10%, #3b82f644 50%, #3b82f622 90%, transparent 100%)", label: "azul" },
          { bg: "linear-gradient(90deg, transparent 0%, #9333ea22 10%, #9333ea44 50%, #9333ea22 90%, transparent 100%)", label: "roxa" },
          { bg: "linear-gradient(90deg, transparent 0%, #92400e22 10%, #92400e44 50%, #92400e22 90%, transparent 100%)", label: "marrom" },
          { bg: "linear-gradient(90deg, transparent 0%, #1a1a1a33 10%, #1a1a1a55 50%, #1a1a1a33 90%, transparent 100%)", label: "preta" },
          { bg: "linear-gradient(90deg, transparent 0%, #dc262622 10%, #dc262644 50%, #dc262622 90%, transparent 100%)", label: "vermelha" },
        ].map((belt, i) => {
          const fromTop = i % 2 === 0
          const posStyle = fromTop ? { top: `${2 + (i / 2) * 32}%` } : { bottom: `${2 + ((i - 1) / 2) * 32}%` }
          return (
            <motion.div
              key={belt.label}
              className="absolute left-0 right-0 h-[13vh]"
              style={{ opacity: 0, ...posStyle, background: belt.bg }}
              initial={{ y: fromTop ? "-100%" : "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{
                duration: 1.4,
                delay: 0.2 * i,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          )
        })}
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* OssTrack */}
        <h1 className={`text-[clamp(4rem,15vw,10rem)] font-black leading-[0.85] tracking-[-0.04em] mb-8 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <span style={{ color: "var(--text)" }}>Oss</span>
          <span className="gradient-gold-text">Track</span>
        </h1>

        {/* Tagline */}
        <p className={`text-base md:text-lg max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ color: "var(--text-secondary)" }}>
          {t("titulo2")}
        </p>
        <p className={`text-xs md:text-sm max-w-md mx-auto mt-2 leading-relaxed transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ color: "var(--text-muted)" }}>
          {t("subtitle")}
        </p>

        <div className="mb-8 mt-8" />

        {/* CTAs */}
        <div className={`flex items-center justify-center gap-4 flex-wrap transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Link href="/cadastro" className="btn-gold px-10 py-4 text-base font-bold inline-block hover:scale-105 transition-transform active:scale-95">
            {t("cta")}
          </Link>
          <Link href="/login"
            className="px-9 py-4 rounded-xl font-bold text-base border border-[var(--dark-border)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all duration-300" style={{ color: "var(--text-secondary)" }}>
            {t("login")}
          </Link>
        </div>

        <div className={`mt-4 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Link href="/screenshot/demo"
            className="text-xs hover:text-[var(--gold)] transition-colors inline-flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Ver demonstração
          </Link>
        </div>

        {/* Stats — agora obtidos do banco de dados */}
        {stats && (
          <div className={`flex items-center justify-center gap-4 sm:gap-8 md:gap-16 mt-20 transition-all duration-700 delay-300 ${mounted ? "opacity-100" : "opacity-0"}`}>
            {[
              { value: mounted ? formatStat(stats.academias) : "0", label: t("statsAcademias") },
              { value: mounted ? formatStat(stats.alunos) : "0", label: t("statsAlunos") },
              { value: mounted ? `${stats.retencao}%` : "0%", label: t("statsRetencao") },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center relative">
                <div className="text-3xl md:text-4xl font-black gradient-gold-text">{stat.value}</div>
                <div className="text-xs mt-1.5 tracking-wide uppercase font-semibold" style={{ color: "var(--text-secondary)" }}>{stat.label}</div>
                {i < 2 && <div className="hidden md:block absolute top-1/2 -translate-y-1/2 w-px h-8" style={{ left: "calc(100% + 2.5rem)", background: "var(--border)" }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

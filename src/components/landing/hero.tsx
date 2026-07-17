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
    <section className="relative min-h-screen flex items-center justify-center px-5 overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,168,71,0.06)_0%,transparent_60%)]" />

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
          <span className="text-white">Oss</span>
          <span className="gradient-gold-text">Track</span>
        </h1>

        {/* Tagline */}
        <p className={`text-lg md:text-xl gradient-gold-text max-w-xl mx-auto leading-relaxed font-black tracking-wide transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          The Jiu Jitsu Revolution &mdash; {t("titulo2")}
        </p>

        <div className="mb-12 mt-10" />

        {/* CTAs */}
        <div className={`flex items-center justify-center gap-4 flex-wrap transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Link href="/cadastro" className="btn-gold px-10 py-4 text-base font-bold inline-block hover:scale-105 transition-transform active:scale-95">
            {t("cta")}
          </Link>
          <Link href="/login"
            className="px-9 py-4 rounded-xl font-bold text-base border border-[var(--dark-border)] text-white hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all duration-300">
            {t("login")}
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
                <div className="text-xs text-white/60 mt-1.5 tracking-wide uppercase font-semibold">{stat.label}</div>
                {i < 2 && <div className="hidden md:block absolute top-1/2 -translate-y-1/2 w-px h-8 bg-white/10" style={{ left: "calc(100% + 2.5rem)" }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

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

      {/* Jiu-Jitsu belts background — alternating from top and bottom */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {[
          { color: "var(--belt-branca)", label: "branca" },
          { color: "var(--belt-azul)", label: "azul" },
          { color: "var(--belt-roxa)", label: "roxa" },
          { color: "var(--belt-marrom)", label: "marrom" },
          { color: "var(--belt-preta)", label: "preta" },
          { color: "var(--belt-coral)", label: "coral" },
          { color: "var(--belt-vermelha)", label: "vermelha" },
        ].map((belt, i) => {
          const fromTop = i % 2 === 0
          const verticalPos = 8 + i * 12
          return (
            <motion.div
              key={belt.label}
              className="absolute left-0 right-0 h-[12vh]"
              style={{
                top: fromTop ? `${verticalPos}%` : undefined,
                bottom: !fromTop ? `${100 - verticalPos - 12}%` : undefined,
                background: `linear-gradient(90deg, transparent 0%, ${belt.color}15 15%, ${belt.color}22 50%, ${belt.color}15 85%, transparent 100%)`,
                opacity: 0,
              }}
              initial={{ y: fromTop ? "-120%" : "120%" }}
              animate={mounted ? { y: "0%", opacity: 1 } : {}}
              transition={{
                duration: 1.2,
                delay: 0.15 * i,
                ease: [0.25, 0.46, 0.45, 0.94],
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
          <div className={`flex items-center justify-center gap-10 md:gap-16 mt-20 transition-all duration-700 delay-300 ${mounted ? "opacity-100" : "opacity-0"}`}>
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

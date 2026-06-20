"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useT } from "@/lib/use-t"
import { useEffect, useState } from "react"

const rankBelts = [
  { color: "#e8e8e8", shadow: "rgba(200,200,200,0.3)", label: "Branca" },
  { color: "#2563eb", shadow: "rgba(37,99,235,0.3)", label: "Azul" },
  { color: "#9333ea", shadow: "rgba(147,51,234,0.3)", label: "Roxa" },
  { color: "#92400e", shadow: "rgba(146,64,14,0.3)", label: "Marrom" },
  { color: "#1a1a1a", shadow: "rgba(255,255,255,0.15)", label: "Preta" },
]

export function Hero() {
  const t = useT("hero")
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <section className="relative min-h-screen flex items-center justify-center px-5 overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,168,71,0.06)_0%,transparent_60%)]" />

      {/* Belts — positioned above text area para não interferir */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {rankBelts.map((belt, i) => (
          <motion.div
            key={belt.label}
            initial={{ x: "120vw", rotate: 12 - i * 3, opacity: 0 }}
            animate={mounted ? { x: `${45 - i * 8}vw`, rotate: -2 + i * 0.5, opacity: 0.6 } : {}}
            transition={{ duration: 1.2, delay: 0.15 * i + 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: "absolute", top: `${8 + i * 4}%`, height: 4 + i * 1.2,
              width: `${60 - i * 5}vw`, maxWidth: 420, borderRadius: 4,
              background: belt.color,
              boxShadow: `0 0 20px ${belt.shadow}`,
              transformOrigin: "left center",
            }}
          >
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* OssTrack */}
        <h1 className={`text-[clamp(4rem,15vw,10rem)] font-black leading-[0.85] tracking-[-0.04em] mb-8 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <span className="text-white">Oss</span>
          <span className="gradient-gold-text">Track</span>
        </h1>

        {/* Taglines — white sólido, alta legibilidade */}
        <p className={`text-base md:text-lg text-white/90 max-w-lg mx-auto leading-relaxed font-medium transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {t("badge")}
        </p>
        <p className={`text-sm md:text-base text-white/70 max-w-lg mx-auto leading-relaxed mt-1 transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
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

        {/* Stats */}
        <div className={`flex items-center justify-center gap-10 md:gap-16 mt-20 transition-all duration-700 delay-300 ${mounted ? "opacity-100" : "opacity-0"}`}>
          {[
            { value: mounted ? "500+" : "0", label: t("statsAcademias") },
            { value: mounted ? "15.000+" : "0", label: t("statsAlunos") },
            { value: mounted ? "98%" : "0%", label: t("statsRetencao") },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center relative">
              <div className="text-3xl md:text-4xl font-black gradient-gold-text">{stat.value}</div>
              <div className="text-xs text-white/60 mt-1.5 tracking-wide uppercase font-semibold">{stat.label}</div>
              {i < 2 && <div className="hidden md:block absolute top-1/2 -translate-y-1/2 w-px h-8 bg-white/10" style={{ left: "calc(100% + 2.5rem)" }} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

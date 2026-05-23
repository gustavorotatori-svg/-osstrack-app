"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"

const phrases = [
  "Academia e professor: R$0. Aluno premium: R$4,90. Simples.",
  "Check-in com geolocalização. Anti-fraude. 100% digital.",
  "Ranking, streak, conquistas e gamificação real.",
  "Do branco ao preto. Sua evolução no tatame.",
  "Professor autônomo? Funciona sem academia também.",
  "Compartilhe sua evolução. Gere arte automaticamente.",
]

const particles = [
  { emoji: "🥋", x: 10, y: 20, dur: 7, size: 2, delay: 0 },
  { emoji: "🥋", x: 85, y: 15, dur: 5.5, size: 1.8, delay: 0.5 },
  { emoji: "🥋", x: 75, y: 75, dur: 6.5, size: 2.2, delay: 1 },
  { emoji: "🥋", x: 20, y: 80, dur: 8, size: 1.5, delay: 0.3 },
  { emoji: "🟤", x: 90, y: 50, dur: 6, size: 1.2, delay: 0.8 },
  { emoji: "⚫", x: 5, y: 55, dur: 7.5, size: 1.2, delay: 1.2 },
  { emoji: "🔵", x: 50, y: 10, dur: 5, size: 1, delay: 0.2 },
  { emoji: "🟣", x: 40, y: 85, dur: 6.8, size: 1, delay: 0.6 },
]

function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let current = 0
    const step = Math.ceil(target / (duration / 16))
    const id = setInterval(() => {
      current += step
      if (current >= target) { setCount(target); clearInterval(id) }
      else setCount(current)
    }, 16)
    return () => clearInterval(id)
  }, [target, duration, start])
  return count
}

function useCountUpSuffix(target: number, suffix: string, duration: number) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const count = useCountUp(target, duration, visible)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true) }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return { ref, display: visible ? `${count}${suffix}` : `0${suffix}` }
}

function StatCard({ target, suffix, label, delay }: { target: number; suffix: string; label: string; delay: number }) {
  const { ref, display } = useCountUpSuffix(target, suffix, 2000)
  return (
    <div ref={ref} className="text-center animate-hero-fade-up" style={{ animationDelay: `${delay}s` }}>
      <div className="text-3xl md:text-4xl font-black gradient-gold-text">{display}</div>
      <div className="text-xs text-[var(--white-muted)] mt-1.5 tracking-wide uppercase">{label}</div>
    </div>
  )
}

export function Hero() {
  const [phraseIdx, setPhraseIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setPhraseIdx((p) => (p + 1) % phrases.length), 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="min-h-screen flex items-center justify-center px-5 pt-36 pb-20 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 z-0 animate-gradient-shift" style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #111 25%, #0d0d0d 50%, #1a0f0a 75%, #0a0a0a 100%)",
      }} />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--gold)]/4 rounded-full blur-3xl animate-float-slow" style={{ "--dur": "8s" } as any} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--red)]/8 rounded-full blur-3xl animate-float-slow" style={{ "--dur": "10s" } as any} />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute z-[1] pointer-events-none select-none animate-float-up"
          style={{
            left: `${p.x}%`, top: `${p.y}%`, fontSize: `${p.size}rem`,
            opacity: 0.12, animationDelay: `${p.delay}s`, "--dur": `${p.dur}s`,
          } as any}
        >
          {p.emoji}
        </div>
      ))}

      {/* Floating belt decoration */}
      <div className="absolute right-[8%] top-[30%] z-[1] pointer-events-none select-none animate-belt-sway hidden md:block">
        <div className="w-20 h-2 rounded-full bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-yellow-300 opacity-20 shadow-lg" />
        <div className="w-16 h-2 rounded-full bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-yellow-300 opacity-15 mt-1 ml-4" />
        <div className="w-12 h-2 rounded-full bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-yellow-300 opacity-10 mt-1 ml-8" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] rounded-full text-sm text-[var(--gold)] font-medium mb-8 animate-hero-fade-up">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Transformando academias de Jiu-Jitsu
        </div>

        {/* Title */}
        <h1 className="text-[clamp(2.5rem,9vw,5rem)] font-black leading-[1.05] tracking-[-3px] mb-6 relative">
          <span className="block animate-hero-fade-up" style={{ animationDelay: "0.2s" }}>
            Sua jornada no{" "}
            <span className="relative inline-block animate-shimmer-gold" style={{
              background: "linear-gradient(90deg, var(--gold) 0%, var(--gold-light) 25%, var(--gold) 50%, var(--gold-light) 75%, var(--gold) 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              tatame
            </span>
          </span>
          <span className="block animate-hero-fade-up" style={{ animationDelay: "0.4s" }}>
            começa aqui.
          </span>
        </h1>

        {/* Rotating subtitle */}
        <div className="h-[4.5rem] md:h-[3.2rem] flex items-center justify-center overflow-hidden mb-10">
          <p
            key={phraseIdx}
            className="text-[clamp(0.95rem,2.5vw,1.25rem)] text-[var(--white-muted)] max-w-2xl mx-auto leading-relaxed animate-hero-fade-up"
            style={{ animationDuration: "0.5s" }}
          >
            {phrases[phraseIdx]}
          </p>
        </div>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-4 flex-wrap animate-hero-fade-up" style={{ animationDelay: "0.6s" }}>
          <Link
            href="/cadastro"
            className="btn-gold px-8 py-4 text-base animate-pulse-glow-gold relative overflow-hidden group"
          >
            <span className="relative z-10">Começar Grátis</span>
            <span className="relative z-10 ml-2 group-hover:translate-x-1 transition-transform">→</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-700" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-xl font-bold text-base border border-[var(--dark-border)] text-white hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Fazer Login
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 md:gap-14 mt-16">
          <StatCard target={500} suffix="+" label="Academias" delay={0.8} />
          <StatCard target={15000} suffix="+" label="Alunos Ativos" delay={0.9} />
          <StatCard target={98} suffix="%" label="Satisfação" delay={1} />
        </div>

        {/* Bottom glow bar */}
        <div className="mt-20 flex justify-center">
          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[var(--gold)]/40 to-transparent animate-pulse-glow-gold rounded-full" />
        </div>
      </div>
    </section>
  )
}

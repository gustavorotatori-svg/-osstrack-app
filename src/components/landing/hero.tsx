"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { useT } from "@/lib/use-t"

const phrases = [
  "Toda faixa preta foi uma faixa branca que nunca desistiu.",
  "Academia e professor: R$0. Aluno premium: R$4,90.",
  "Cada check-in é um capítulo da sua história no tatame.",
  "A evolução não é linear — no OssTrack ela é visível.",
  "O melhor de você aparece quando ninguém está olhando.",
]

export function Hero() {
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const t = useT("hero")

  useEffect(() => {
    const id = setInterval(() => setPhraseIdx((p) => (p + 1) % phrases.length), 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const onLoad = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(onLoad)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-28 pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      <div className="absolute inset-0 z-[1] opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 30% 40%, rgba(201,168,76,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(139,26,26,0.2) 0%, transparent 50%)`,
      }} />

      <div
        className="absolute z-[1] pointer-events-none select-none"
        style={{
          opacity: loaded ? 0.03 : 0,
          transition: "opacity 2s ease",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <svg width="360" height="360" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--gold)]">
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="0.4" />
          <circle cx="100" cy="100" r="75" stroke="currentColor" strokeWidth="0.3" strokeDasharray="3 6" />
          <path d="M60 100 Q80 55 100 65 Q120 75 140 100 Q120 125 100 135 Q80 145 60 100Z" stroke="currentColor" strokeWidth="0.4" fill="none" />
          <path d="M70 100 Q85 72 100 77 Q115 82 130 100 Q115 118 100 123 Q85 128 70 100Z" stroke="currentColor" strokeWidth="0.25" fill="none" />
          <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="0.2" />
        </svg>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <div
          className="transition-all duration-1000 ease-out"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(24px)",
          }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.15)] rounded-full text-xs text-[var(--gold)] font-medium mb-10 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            {t("badge")}
          </div>

          <h1 className="text-[clamp(2.8rem,9vw,4.5rem)] font-bold leading-[1.05] tracking-tight mb-5">
            <span className="text-white">{t("titulo1")} </span>
            <span className="relative inline-block">
              <span className="text-[var(--gold)]">tatame</span>
              <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-50" />
            </span>
            <br />
            <span className="text-white">{t("titulo2")}</span>
          </h1>
        </div>

        <div
          className="transition-all duration-1000 ease-out"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(16px)",
            transitionDelay: "0.15s",
          }}
        >
          <div className="flex items-center justify-center mb-10">
            <div className="px-5 py-3 rounded-2xl bg-[rgba(17,17,17,0.6)] border border-[var(--dark-border)] backdrop-blur-sm">
              <p className="text-[clamp(0.85rem,1.8vw,1.05rem)] text-[var(--gold)] max-w-xl mx-auto leading-snug font-medium tracking-tight transition-opacity duration-500" key={phraseIdx}>
                &ldquo;{phrases[phraseIdx]}&rdquo;
              </p>
            </div>
          </div>
        </div>

        <div
          className="transition-all duration-1000 ease-out"
          style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(16px)",
            transitionDelay: "0.3s",
          }}
        >
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/cadastro" className="btn-gold px-8 py-3.5 text-base font-semibold">
              {t("cta")}
              <span className="ml-2">→</span>
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-xl font-semibold text-base border border-[var(--dark-border)] text-[var(--white-muted)] hover:text-white hover:border-[var(--dark-border-light)] transition-all duration-300"
            >
              {t("login")}
            </Link>
          </div>
        </div>

        <div
          className="transition-all duration-1000 ease-out"
          style={{
            opacity: loaded ? 1 : 0,
            transitionDelay: "0.5s",
          }}
        >
          <div className="flex items-center justify-center gap-12 md:gap-20 mt-20">
            {[
              { target: 500, suffix: "+", label: t("statsAcademias") },
              { target: 15000, suffix: "+", label: t("statsAlunos") },
              { target: 98, suffix: "%", label: t("statsRetencao") },
            ].map((stat, i) => (
              <StatCard key={stat.label} target={stat.target} suffix={stat.suffix} label={stat.label} delay={i * 0.15} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function StatCard({ target, suffix, label, delay }: { target: number; suffix: string; label: string; delay: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true) }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    setCount(0)
    let current = 0
    const step = Math.ceil(target / 125)
    const id = setInterval(() => {
      current += step
      if (current >= target) { setCount(target); clearInterval(id) }
      else setCount(current)
    }, 16)
    return () => clearInterval(id)
  }, [target, visible])

  return (
    <div
      ref={ref}
      className="text-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
        transitionDelay: `${delay}s`,
      }}
    >
      <div className="text-3xl md:text-4xl font-bold text-[var(--gold)]">{visible ? `${count}${suffix}` : `0${suffix}`}</div>
      <div className="text-xs text-[var(--white-muted)] mt-1.5 tracking-wide">{label}</div>
    </div>
  )
}

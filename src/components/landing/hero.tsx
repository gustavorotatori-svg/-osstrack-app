"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { useT } from "@/lib/use-t"

export function Hero() {
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const t = useT("hero")

  const phrases = [
    "Toda faixa preta foi uma faixa branca que nunca desistiu.",
    "Academia e professor: R$0. Aluno premium: R$4,90.",
    "Cada check-in é um capítulo da sua história no tatame.",
    "A evolução não é linear — no OssTrack ela é visível.",
    "O melhor de você aparece quando ninguém está olhando.",
  ]

  useEffect(() => {
    setLoaded(true)
    const id = setInterval(() => setPhraseIdx((p) => (p + 1) % phrases.length), 5000)
    return () => clearInterval(id)
  }, [phrases.length])

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-28 pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <div style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.8s ease, transform 0.8s ease", transform: loaded ? "translateY(0)" : "translateY(20px)" }}>
          <h1 className="text-[clamp(2.5rem,8vw,4.5rem)] font-bold leading-[1.05] tracking-tight mb-5">
            <span className="text-white">{t("titulo1")} </span>
            <span className="text-[var(--gold)]">tatame</span>
            <br />
            <span className="text-white">{t("titulo2")}</span>
          </h1>
        </div>

        <div style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s", transform: loaded ? "translateY(0)" : "translateY(16px)" }}>
          <div className="flex items-center justify-center mb-10">
            <div className="px-5 py-3 rounded-2xl bg-[rgba(17,17,17,0.6)] border border-[var(--dark-border)]">
              <p className="text-[clamp(0.85rem,1.8vw,1.05rem)] text-[var(--gold)] max-w-xl mx-auto leading-snug font-medium tracking-tight">
                &ldquo;{phrases[phraseIdx]}&rdquo;
              </p>
            </div>
          </div>
        </div>

        <div style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s", transform: loaded ? "translateY(0)" : "translateY(16px)" }}>
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

        <div style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.8s ease 0.5s" }}>
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
    <div ref={ref} className="text-center" style={{ transition: "opacity 0.6s ease, transform 0.6s ease", transitionDelay: `${delay}s`, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)" }}>
      <div className="text-3xl md:text-4xl font-bold text-[var(--gold)]">{visible ? `${count}${suffix}` : `0${suffix}`}</div>
      <div className="text-xs text-[var(--white-muted)] mt-1.5 tracking-wide">{label}</div>
    </div>
  )
}

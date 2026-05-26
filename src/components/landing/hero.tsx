"use client"

import { motion, AnimatePresence } from "framer-motion"
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

const rankBelts = [
  { color: "#e8e8e8", shadow: "rgba(200,200,200,0.3)", label: "Branca" },
  { color: "#2563eb", shadow: "rgba(37,99,235,0.3)", label: "Azul" },
  { color: "#9333ea", shadow: "rgba(147,51,234,0.3)", label: "Roxa" },
  { color: "#92400e", shadow: "rgba(146,64,14,0.3)", label: "Marrom" },
  { color: "#1a1a1a", shadow: "rgba(255,255,255,0.15)", label: "Preta" },
]

const goldParticles = Array.from({ length: 20 }, (_, i) => ({
  x: (i % 5) * 25 - 10,
  y: Math.floor(i / 5) * 25 - 10,
  size: Math.random() * 4 + 2,
  delay: Math.random() * 0.5,
  dur: Math.random() * 2 + 2,
}))

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const wordVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, damping: 12, stiffness: 100 } },
}

export function Hero() {
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [beltDone, setBeltDone] = useState(false)
  const [titleDone, setTitleDone] = useState(false)
  const particlesRef = useRef<HTMLDivElement>(null)
  const t = useT("hero")

  useEffect(() => {
    const id = setInterval(() => setPhraseIdx((p) => (p + 1) % phrases.length), 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  const titleWords = ["Sua", "jornada", "no"]
  const subtitleLine = "começa aqui."

  return (
    <section className="relative min-h-screen flex items-center justify-center px-5 pt-24 md:pt-36 pb-20 overflow-hidden">
      {/* Deep background */}
      <div className="absolute inset-0 z-0 bg-[#0a0a0a]" />
      <div className="absolute inset-0 z-[1] opacity-[0.02]" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)`,
      }} />

      {/* Glow orbs seguindo mouse */}
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full blur-3xl pointer-events-none z-[1]"
        animate={{
          background: [
            "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)",
            "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          left: `${10 + mousePos.x * 20}%`,
          top: `${10 + mousePos.y * 20}%`,
          transition: "left 1.5s ease-out, top 1.5s ease-out",
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none z-[1]"
        style={{
          background: "radial-gradient(circle, rgba(139,26,26,0.04) 0%, transparent 70%)",
          right: `${10 + (1 - mousePos.x) * 20}%`,
          bottom: `${10 + (1 - mousePos.y) * 20}%`,
          transition: "right 2s ease-out, bottom 2s ease-out",
        }}
      />

      {/* BELTS: 5 faixas voando em sequência */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        {rankBelts.map((belt, i) => (
          <motion.div
            key={belt.label}
            initial={{ x: "120vw", rotate: 12 - i * 3, opacity: 0 }}
            animate={{ x: `${45 - i * 8}vw`, rotate: -2 + i * 0.5, opacity: 1 }}
            onAnimationComplete={() => { if (i === rankBelts.length - 1) { setTimeout(() => setBeltDone(true), 300) } }}
            transition={{
              duration: 1.2,
              delay: 0.15 * i + 0.3,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{
              position: "absolute",
              top: `${38 + i * 6}%`,
              height: 5 + i * 1.5,
              width: `${65 - i * 5}vw`,
              maxWidth: 500,
              borderRadius: 4,
              background: belt.color,
              boxShadow: `0 0 20px ${belt.shadow}, 0 4px 15px rgba(0,0,0,0.3)`,
              transformOrigin: "left center",
            }}
          >
            <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </motion.div>
        ))}
      </div>

      {/* Golden crest sem fio */}
      <motion.div
        className="absolute z-[1] pointer-events-none select-none"
        initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
        animate={beltDone ? { opacity: 0.04, scale: 1, rotate: 0 } : {}}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
      >
        <svg width="420" height="420" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--gold)]">
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="0.4" />
          <circle cx="100" cy="100" r="75" stroke="currentColor" strokeWidth="0.3" strokeDasharray="3 6" />
          <path d="M60 100 Q80 55 100 65 Q120 75 140 100 Q120 125 100 135 Q80 145 60 100Z" stroke="currentColor" strokeWidth="0.4" fill="none" />
          <path d="M70 100 Q85 72 100 77 Q115 82 130 100 Q115 118 100 123 Q85 128 70 100Z" stroke="currentColor" strokeWidth="0.25" fill="none" />
          <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="0.2" />
          <path d="M85 100 L100 85 L115 100 L100 115Z" stroke="currentColor" strokeWidth="0.3" fill="none" />
        </svg>
      </motion.div>

      {/* Gold particles */}
      <AnimatePresence>
        {titleDone && goldParticles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute z-[3] pointer-events-none rounded-full"
            style={{ backgroundColor: "var(--gold)", width: p.size, height: p.size }}
            initial={{ opacity: 0, x: "50vw", y: "50vh" }}
            animate={{ opacity: [0, 1, 0], x: [`${50 + p.x}vw`, `${50 + p.x + (Math.random() - 0.5) * 20}vw`], y: [`${50 + p.y}vh`, `${30 + p.y + (Math.random() - 0.5) * 30}vh`] }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.dur, delay: p.delay, ease: "easeOut", repeat: Infinity, repeatDelay: 3 }}
          />
        ))}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.15)] rounded-full text-xs text-[var(--gold)] font-medium mb-10 tracking-wide uppercase"
          initial={{ opacity: 0, y: -20 }}
          animate={beltDone ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          {t("badge")}
        </motion.div>

        {/* Title */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={beltDone ? "show" : "hidden"}
          className="mb-4"
        >
          <h1 className="text-[clamp(2.8rem,10vw,5.5rem)] font-black leading-[1.0] tracking-[-3px]">
            <span className="flex flex-wrap justify-center gap-x-4">
              {titleWords.map((word) => (
                <motion.span key={word} variants={wordVariants} className="text-white">
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="block mt-2">
              <motion.span
                className="relative inline-block"
                variants={wordVariants}
                onAnimationComplete={() => setTimeout(() => setTitleDone(true), 300)}
              >
                <motion.span
                  className="gradient-gold-text inline-block"
                  style={{
                    background: "linear-gradient(90deg, var(--gold) 0%, var(--gold-light) 30%, var(--gold) 60%, var(--gold-dark) 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    backgroundSize: "200% auto",
                  }}
                  animate={beltDone ? { backgroundPosition: ["200% center", "-200% center"] } : {}}
                  transition={{ duration: 1.5, delay: 0.5, ease: "linear" }}
                >
                  tatame
                </motion.span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={beltDone ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
                  style={{
                    background: "linear-gradient(90deg, transparent, var(--gold), var(--gold-light), var(--gold), transparent)",
                  }}
                />
              </motion.span>
              <motion.span variants={wordVariants} className="text-white ml-3">
                {subtitleLine}
              </motion.span>
            </span>
          </h1>
        </motion.div>

        {/* Rotating phrase */}
        <motion.div
          className="flex items-center justify-center overflow-hidden mb-10"
          initial={{ opacity: 0 }}
          animate={titleDone ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={phraseIdx}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="px-5 py-3 rounded-2xl bg-[rgba(17,17,17,0.6)] border border-[var(--dark-border)] backdrop-blur-sm"
            >
              <p className="text-[clamp(0.9rem,2vw,1.15rem)] text-[var(--gold)] max-w-xl mx-auto leading-snug font-bold tracking-tight">
                &ldquo;{phrases[phraseIdx]}&rdquo;
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex items-center justify-center gap-4 flex-wrap"
          initial={{ opacity: 0, y: 30 }}
          animate={titleDone ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4, type: "spring", damping: 15 }}
        >
          <Link
            href="/cadastro"
            className="btn-gold px-9 py-4 text-base relative overflow-hidden group"
          >
            <span className="relative z-10 font-bold">{t("cta")}</span>
            <span className="relative z-10 ml-2 group-hover:translate-x-1 transition-transform font-bold">→</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
          </Link>
          <Link
            href="/login"
            className="px-9 py-4 rounded-xl font-bold text-base border border-[var(--dark-border)] text-white hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            {t("login")}
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex items-center justify-center gap-10 md:gap-16 mt-16"
          initial={{ opacity: 0 }}
          animate={titleDone ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {[
            { target: 500, suffix: "+", label: t("statsAcademias") },
            { target: 15000, suffix: "+", label: t("statsAlunos") },
            { target: 98, suffix: "%", label: t("statsRetencao") },
          ].map((stat, i) => (
            <div key={stat.label}>
              <StatCard target={stat.target} suffix={stat.suffix} label={stat.label} delay={0.8 + i * 0.15} start={titleDone} />
              {i < 2 && <div className="hidden md:block absolute top-1/2 -translate-y-1/2 w-px h-8 bg-[var(--dark-border)]" style={{ left: `${33 * (i + 1)}%` }} />}
            </div>
          ))}
        </motion.div>

        {/* Bottom glow bar */}
        <motion.div
          className="mt-20 flex justify-center"
          initial={{ opacity: 0 }}
          animate={titleDone ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[var(--gold)]/40 to-transparent animate-pulse-glow-gold rounded-full" />
        </motion.div>
      </div>
    </section>
  )
}

function StatCard({ target, suffix, label, delay, start }: { target: number; suffix: string; label: string; delay: number; start: boolean }) {
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
    if (!visible || !start) return
    setCount(0)
    let current = 0
    const step = Math.ceil(target / 125)
    const id = setInterval(() => {
      current += step
      if (current >= target) { setCount(target); clearInterval(id) }
      else setCount(current)
    }, 16)
    return () => clearInterval(id)
  }, [target, visible, start])

  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={start ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <div className="text-3xl md:text-4xl font-black gradient-gold-text">{visible && start ? `${count}${suffix}` : `0${suffix}`}</div>
      <div className="text-xs text-[var(--white-muted)] mt-1.5 tracking-wide uppercase">{label}</div>
    </motion.div>
  )
}

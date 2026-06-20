"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useT } from "@/lib/use-t"
import { useEffect, useRef, useState } from "react"

const testimonialsData = [
  {
    initials: "CM", name: "Carlos Mota", role: "Mestre — Nova União JJ",
    text: "O OssTrack nos fez perceber que cada presença é uma história. Meus alunos não faltam mais porque não querem quebrar o streak. O engajamento subiu 40% em 3 meses. Mas o mais bonito é ver eles celebrando cada grau como se fosse o primeiro.",
  },
  {
    initials: "AS", name: "André Santos", role: "Professor — Alliance SP",
    text: "O compartilhamento social foi um divisor de águas. Os alunos postam as artes automáticas no Instagram e os amigos perguntam 'onde é essa academia?'. Marketing orgânico de verdade, sem pagar um centavo.",
  },
  {
    initials: "PL", name: "Paulo Lima", role: "CEO — Nova União JJ",
    text: "Depois da pandemia, o engajamento tinha despencado. O OssTrack trouxe de volta. Os alunos competem pra ver quem tem o maior streak, disputam o Mestre do Mês. O tatame nunca esteve tão cheio.",
  },
  {
    initials: "RM", name: "Ricardo Martins", role: "Professor — Gracie BH",
    text: "Implementei o OssTrack em 3 unidades. A统一idade dos dados, o controle de presença e a relação com os pais dos alunos menores de idade mudou completamente nossa gestão.",
  },
  {
    initials: "LF", name: "Luiz Fernando", role: "Dono — RFT Jiu-Jitsu",
    text: "Eu usava planilha no Excel e grupo de WhatsApp. Hoje tenho relatório de tudo. Quem treina mais, quem está sumido, quem precisa de atenção. Parece que contratei um funcionário só pra isso.",
  },
]

const avatarColors = ["#d4a847", "#2563eb", "#9333ea", "#059669", "#dc2626"]

function AutoScrollCarousel() {
  const [width, setWidth] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!trackRef.current) return
    const updateWidth = () => {
      if (trackRef.current) setWidth(trackRef.current.scrollWidth - trackRef.current.offsetWidth)
    }
    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    observer.observe(trackRef.current)
    return () => observer.disconnect()
  }, [])

  const x = useMotionValue(0)
  const smoothX = useTransform(x, (v) => v)

  useEffect(() => {
    if (width <= 0) return
    const controls = animate(x, -width, {
      duration: 30,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    })
    return controls.stop
  }, [width, x])

  return (
    <motion.div
      ref={trackRef}
      className="flex gap-5 cursor-grab active:cursor-grabbing"
      style={{ x: smoothX }}
      drag="x"
      dragConstraints={{ right: 0, left: -width }}
      dragElastic={0.1}
      onDragStart={() => animate(x, x.get(), { duration: 0.1 })}
      onDragEnd={() => {
        const remaining = -(width + x.get())
        const duration = Math.max(5, (remaining / width) * 20)
        animate(x, -width, { duration, ease: "linear" })
      }}
    >
      {[...testimonialsData, ...testimonialsData].map((t, i) => (
        <div
          key={`${t.name}-${i}`}
          className="min-w-[340px] max-w-[380px] shrink-0 bg-[var(--bg-card)] border border-[var(--dark-border)] rounded-2xl p-7 transition-all duration-300 hover:border-[rgba(201,168,76,0.2)] hover:-translate-y-1"
        >
          <div className="flex gap-0.5 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <motion.span
                key={s}
                className="text-sm"
                style={{ color: "var(--gold)" }}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: s * 0.05 }}
              >
                ★
              </motion.span>
            ))}
          </div>
          <p className="text-sm text-[var(--white-muted)] leading-relaxed italic mb-6">
            &ldquo;{t.text}&rdquo;
          </p>
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-black shrink-0"
              style={{
                background: `linear-gradient(135deg, ${avatarColors[i % avatarColors.length]}, ${avatarColors[(i + 1) % avatarColors.length]})`,
              }}
            >
              {t.initials}
            </div>
            <div>
              <div className="font-semibold text-sm">{t.name}</div>
              <div className="text-xs text-[var(--white-muted)]">{t.role}</div>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  )
}

export function Testimonials() {
  const t = useT("testimonials")

  return (
    <section id="depoimentos" className="py-24 px-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(201,168,76,0.02)] to-transparent" />
      {/* Gradient edges to fade the carousel */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-r from-[var(--bg)] to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-l from-[var(--bg)] to-transparent" />

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-xl mx-auto mb-14"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9, x: -10 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, type: "spring" }}
            className="inline-block px-5 py-2 bg-[rgba(201,168,76,0.08)] text-xs text-[var(--gold)] font-semibold uppercase tracking-widest mb-5"
            style={{ clipPath: "polygon(0% 0%, 100% 0%, calc(100% - 10px) 100%, 10px 100%)" }}
          >
            {t("badge")}
          </motion.span>
          <h2 className="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold tracking-tight mb-4">
            {t("titulo")}
          </h2>
          <p className="text-[var(--white-muted)] leading-relaxed">
            {t("subtitulo")}
          </p>
        </motion.div>

        <div className="relative overflow-hidden">
          <AutoScrollCarousel />
        </div>

        {/* Pause hint */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center text-[10px] text-[var(--text-muted)] mt-6"
        >
          Arraste para navegar • scroll infinito
        </motion.p>
      </div>
    </section>
  )
}

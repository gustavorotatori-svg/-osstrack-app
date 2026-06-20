"use client"

import Link from "next/link"
import { motion } from "framer-motion"

const benefits = [
  { icon: "🥋", label: "Treino Ilimitado" },
  { icon: "🏛️", label: "Gestão Completa" },
  { icon: "🏆", label: "Gamificação" },
  { icon: "📊", label: "Estatísticas" },
]

const beltColors = ["#d4a847", "#2563eb", "#9333ea", "#059669"]

export function FreeSection() {
  return (
    <section id="gratis" className="py-32 px-5 relative overflow-hidden">
      {/* Background efeito de kinetic typography */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(12rem,30vw,30rem)] font-black whitespace-nowrap select-none"
          style={{ color: "rgba(212,168,71,0.02)" }}
          animate={{ x: [0, -20, 10, 0], rotate: [0, -1, 0.5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        >
          GRÁTIS
        </motion.div>
        <motion.div
          className="absolute top-[60%] left-1/2 -translate-x-1/2 text-[clamp(8rem,20vw,20rem)] font-black whitespace-nowrap select-none"
          style={{ color: "rgba(212,168,71,0.015)" }}
          animate={{ x: [10, -10, 20, 10], rotate: [1, -0.5, 0, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        >
          $0
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="inline-block px-4 py-1.5 bg-[rgba(212,168,71,0.08)] border border-[rgba(212,168,71,0.2)] rounded-full text-xs text-[var(--gold)] font-semibold uppercase tracking-widest mb-5"
          >
            100% gratuito
          </motion.span>

          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold tracking-tight leading-tight mb-4">
            Sem mensalidade.{" "}
            <span className="gradient-gold-text">Sem pegadinha.</span>
          </h2>

          <p className="text-[var(--white-muted)] text-lg leading-relaxed max-w-2xl mx-auto mb-16">
            Academia, professor e aluno: R$ 0. Sempre. O OssTrack é e sempre será completamente gratuito.
          </p>
        </motion.div>

        {/* Benefit badges — flutuando, sem card */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
          className="flex flex-wrap justify-center gap-3 mb-14"
        >
          {benefits.map((b, i) => (
            <motion.div
              key={b.label}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: "spring", stiffness: 100, damping: 14 },
                },
              }}
              className="group relative"
            >
              <div
                className="flex items-center gap-2.5 px-5 py-3 rounded-full border transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(255,255,255,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = beltColors[i]
                  e.currentTarget.style.background = `${beltColors[i]}12`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)"
                }}
              >
                <span className="text-lg">{b.icon}</span>
                <span className="text-sm font-bold whitespace-nowrap">{b.label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Link
            href="/cadastro"
            className="btn-gold px-12 py-5 text-base font-bold inline-block hover:scale-105 transition-transform active:scale-95 shadow-[0_8px_40px_rgba(212,168,71,0.2)]"
          >
            Comece agora — é grátis
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

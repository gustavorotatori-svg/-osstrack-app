"use client"

import { useT } from "@/lib/use-t"
import { motion } from "framer-motion"


const cards = [
  { icon: "📍", titleKey: "checkin", descKey: "checkinDesc", accent: "#3b82f6", radius: "24px 8px 24px 8px", floatY: [0, -6, 0], dur: 4 },
  { icon: "📈", titleKey: "evolucao", descKey: "evolucaoDesc", accent: "#6366f1", radius: "8px 24px 8px 24px", floatY: [0, 8, 0], dur: 5 },
  { icon: "🏆", titleKey: "gamificacao", descKey: "gamificacaoDesc", accent: "#d4a847", radius: "24px 24px 8px 8px", floatY: [0, -4, 0], dur: 3.5 },
  { icon: "🎯", titleKey: "metas", descKey: "metasDesc", accent: "#06b6d4", radius: "8px 8px 24px 24px", floatY: [0, 6, 0], dur: 6 },
  { icon: "📱", titleKey: "whatsapp", descKey: "whatsappDesc", accent: "#22c55e", radius: "20px 4px 20px 4px", floatY: [0, -8, 0], dur: 4.5 },
  { icon: "🥋", titleKey: "graduacao", descKey: "graduacaoDesc", accent: "#ef4444", radius: "4px 20px 4px 20px", floatY: [0, 5, 0], dur: 5.5 },
  { icon: "🟢", titleKey: "wellhub", descKey: "wellhubDesc", accent: "#10b981", radius: "16px 16px 16px 16px", floatY: [0, -5, 0], dur: 4.2 },
]

function FeatureCard({ c, i, t }: { c: typeof cards[0]; i: number; t: (k: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: i * 0.08 }}
    >
      <motion.div
        className="relative overflow-hidden h-full border bg-[var(--bg-surface)]"
        style={{
          borderColor: c.accent + "40",
          borderRadius: c.radius,
        }}
        animate={{ y: c.floatY }}
        transition={{ duration: c.dur, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute top-0 left-4 right-4 h-0.5 rounded-full opacity-50" style={{ background: c.accent }} />

        <div className="relative p-6 md:p-7">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{c.icon}</span>
            <h3 className="text-base font-extrabold" style={{ color: "var(--text)" }}>{t(c.titleKey)}</h3>
          </div>

          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {t(c.descKey)}
          </p>
        </div>

        <div
          className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-5 transition-opacity duration-300"
          style={{ background: c.accent }}
        />
      </motion.div>
    </motion.div>
  )
}

export function Features() {
  const t = useT("features")

  return (
    <section id="recursos" className="py-32 px-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(201,168,76,0.01)] to-transparent" />

      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight mb-16 max-w-xl leading-tight gradient-gold-text"
        >
          {t("titulo")}
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((c, i) => (
            <FeatureCard key={c.titleKey} c={c} i={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  )
}

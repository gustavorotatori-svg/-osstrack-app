"use client"

import { useT } from "@/lib/use-t"
import { motion } from "framer-motion"

const cardStyles = [
  { bg: "linear-gradient(135deg, #1e293b, #0f172a)", border: "#334155", accent: "#3b82f6", radius: "24px 8px 24px 8px" },
  { bg: "linear-gradient(135deg, #1a1a2e, #16213e)", border: "#0f3460", accent: "#6366f1", radius: "8px 24px 8px 24px" },
  { bg: "linear-gradient(135deg, #1c1917, #292524)", border: "#44403c", accent: "#d4a847", radius: "24px 24px 8px 8px" },
  { bg: "linear-gradient(135deg, #0f172a, #020617)", border: "#1e293b", accent: "#06b6d4", radius: "8px 8px 24px 24px" },
  { bg: "linear-gradient(135deg, #1a1a1a, #262626)", border: "#404040", accent: "#22c55e", radius: "20px 4px 20px 4px" },
  { bg: "linear-gradient(135deg, #2d0a0a, #1a0505)", border: "#450a0a", accent: "#ef4444", radius: "4px 20px 4px 20px" },
]

const floatVariants = [
  { y: [0, -6, 0], rotate: [0, 1, 0] },
  { y: [0, 8, 0], rotate: [0, -0.5, 0] },
  { y: [0, -4, 0], rotate: [0, 0.5, 0] },
  { y: [0, 6, 0], rotate: [0, -1, 0] },
  { y: [0, -8, 0], rotate: [0, 0.5, 0] },
  { y: [0, 5, 0], rotate: [0, -0.5, 0] },
]

const durations = [4, 5, 3.5, 6, 4.5, 5.5]

export function Features() {
  const t = useT("features")

  const features = [
    { icon: "📍", titleKey: "checkin", descKey: "checkinDesc" },
    { icon: "📈", titleKey: "evolucao", descKey: "evolucaoDesc" },
    { icon: "🏆", titleKey: "gamificacao", descKey: "gamificacaoDesc" },
    { icon: "🎯", titleKey: "metas", descKey: "metasDesc" },
    { icon: "📱", titleKey: "whatsapp", descKey: "whatsappDesc" },
    { icon: "🥋", titleKey: "graduacao", descKey: "graduacaoDesc" },
  ]

  return (
    <section id="recursos" className="py-32 px-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(201,168,76,0.01)] to-transparent" />

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center max-w-xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="inline-block px-5 py-2 bg-[rgba(201,168,76,0.08)] text-xs text-[var(--gold)] font-semibold uppercase tracking-widest mb-5"
              style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
            >
              {t("badge")}
            </motion.span>
            <h2 className="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold tracking-tight mb-4">
              {t("titulo")}
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {t("subtitulo")}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const style = cardStyles[i]
            const float = floatVariants[i]
            return (
              <motion.div
                key={f.titleKey}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                <motion.div
                  className="group relative overflow-hidden"
                  style={{ borderRadius: style.radius }}
                  animate={{ y: float.y, rotate: float.rotate }}
                  transition={{ duration: durations[i], repeat: Infinity, ease: "easeInOut" }}
                >
                <div
                  className="relative p-6 md:p-7 h-full border"
                  style={{ background: style.bg, borderColor: style.border, borderRadius: style.radius }}
                >
                  {/* Accent line */}
                  <div
                    className="absolute top-0 left-4 right-4 h-0.5 rounded-full opacity-60"
                    style={{ background: style.accent }}
                  />

                  <span className="text-3xl block mb-4">{f.icon}</span>
                  <h3 className="text-base font-extrabold mb-2">{t(f.titleKey)}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {t(f.descKey)}
                  </p>

                  {/* Bottom accent indicator */}
                  <div
                    className="absolute bottom-3 right-3 w-8 h-8 rounded-full opacity-10 group-hover:opacity-25 transition-opacity duration-300"
                    style={{ background: style.accent }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )
          })}
        </div>
      </div>
    </section>
  )
}

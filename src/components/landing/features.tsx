"use client"

import { useT } from "@/lib/use-t"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

const beltColors = ["#e8e8e8", "#2563eb", "#9333ea", "#92400e", "#1a1a1a", "#d4a847"]
const beltLabels = ["Branca", "Azul", "Roxa", "Marrom", "Preta", "Coral"]

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

  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const beltX = useTransform(scrollYProgress, [0, 0.5, 1], ["-10%", "0%", "10%"])
  const beltOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.3, 1, 1, 0.3])

  return (
    <section id="recursos" ref={sectionRef} className="py-32 px-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(201,168,76,0.01)] to-transparent" />

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-xl mx-auto mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="inline-block px-4 py-1.5 bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] rounded-full text-xs text-[var(--gold)] font-semibold uppercase tracking-widest mb-5"
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

        {/* Belt horizontal — cada grau é uma feature */}
        <motion.div
          style={{ x: beltX, opacity: beltOpacity }}
          className="flex rounded-2xl overflow-hidden border border-white/5 shadow-2xl"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.titleKey}
              className="group relative flex-1 min-w-0 transition-all duration-500"
              whileHover={{ flex: 2 }}
            >
              {/* Belt color section */}
              <div
                className="relative h-80 flex flex-col items-center justify-center px-3 transition-all duration-500"
                style={{ background: beltColors[i] }}
              >
                {/* Overlay escuro pra legibilidade */}
                <div
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{
                    background: i === 4 ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.15)",
                  }}
                />
                {/* Gold stripe pra preta */}
                {i === 4 && (
                  <div className="absolute inset-x-[15%] top-1/2 -translate-y-1/2 h-[3px] bg-[var(--gold)] rounded-full opacity-60" />
                )}

                <span className="text-3xl relative z-10 mb-2">{f.icon}</span>
                <h3
                  className="text-sm font-extrabold text-center leading-tight relative z-10"
                  style={{ color: i === 4 ? "var(--gold)" : i === 0 ? "#1a1a1a" : "#fff" }}
                >
                  {t(f.titleKey)}
                </h3>

                {/* Belt label */}
                <span
                  className="text-[10px] font-bold uppercase tracking-widest mt-2 relative z-10 px-2 py-0.5 rounded"
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    color: i === 4 ? "var(--gold)" : "#fff",
                  }}
                >
                  {beltLabels[i]} · {i + 1}º grau
                </span>

                {/* Descrição expande no hover */}
                <motion.p
                  className="text-xs text-center leading-relaxed mt-3 relative z-10 max-w-[180px]"
                  style={{ color: i === 0 ? "#333" : "rgba(255,255,255,0.85)" }}
                  initial={{ opacity: 0, height: 0 }}
                  whileHover={{ opacity: 1, height: "auto" }}
                >
                  {t(f.descKey)}
                </motion.p>
              </div>

              {/* Glow na borda direita */}
              <div
                className="absolute right-0 top-0 bottom-0 w-px"
                style={{
                  background: `linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)`,
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center text-[10px] text-[var(--text-muted)] mt-6"
        >
          Passe o mouse sobre cada grau para detalhes
        </motion.p>
      </div>
    </section>
  )
}

"use client"

import { useT } from "@/lib/use-t"
import { motion } from "framer-motion"
import { SmartphoneIcon, TrendingIcon, AwardIcon } from "@/components/ui/icons"

export function HowItWorks() {
  const t = useT("comoFunciona")

  const steps = [
    { icon: SmartphoneIcon, titleKey: "passo1", descKey: "passo1Desc" },
    { icon: TrendingIcon, titleKey: "passo2", descKey: "passo2Desc" },
    { icon: AwardIcon, titleKey: "passo3", descKey: "passo3Desc" },
  ]

  return (
    <section id="funciona" className="py-24 px-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(201,168,76,0.015)] to-transparent" />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] rounded-full text-xs text-[var(--gold)] font-semibold uppercase tracking-widest mb-5"
          >
            {t("badge")}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold tracking-tight mb-4"
          >
            {t("titulo")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[var(--white-muted)] leading-relaxed"
          >
            {t("subtitulo")}
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Phone mockup with animated app screens */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center md:justify-end"
          >
            <div className="relative">
              {/* Glow behind phone */}
              <div className="absolute -inset-10 bg-gradient-radial from-[rgba(201,168,76,0.06)] to-transparent rounded-full blur-3xl" />

              {/* Phone frame */}
              <div className="relative w-[280px] h-[580px] rounded-[2.75rem] border-2 border-[rgba(201,168,76,0.15)] bg-[#0d0d0d] p-3 shadow-[0_0_80px_rgba(201,168,76,0.06)]">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-[#0d0d0d] rounded-b-2xl z-10 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
                  <div className="w-16 h-1.5 rounded-full bg-[#1a1a1a]" />
                </div>

                {/* Screen */}
                <div className="w-full h-full rounded-[2rem] bg-[#0a0a0a] overflow-hidden border border-[rgba(255,255,255,0.04)] pt-8">
                  {/* App header */}
                  <div className="px-4 pt-2 pb-3 flex items-center justify-between border-b border-[rgba(255,255,255,0.04)]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center text-[10px] font-bold text-black">O</div>
                      <span className="text-xs font-bold text-white/80">OssTrack</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-white/40">check-in</span>
                    </div>
                  </div>

                  {/* Animated screen content */}
                  <div className="p-4 space-y-3">
                    {/* Streak card */}
                    <motion.div
                      animate={{ opacity: [0, 1], y: [8, 0] }}
                      transition={{ duration: 0.5, delay: 0.3, repeat: Infinity, repeatDelay: 4 }}
                      className="rounded-xl bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.12)] p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider">Sequência</span>
                        <motion.span
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-xs font-black gradient-gold-text"
                        >🔥 12 dias</motion.span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                        <motion.div
                          animate={{ width: ["0%", "80%"] }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          className="h-full rounded-full bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold-light)]"
                        />
                      </div>
                    </motion.div>

                    {/* Progress item */}
                    <motion.div
                      animate={{ opacity: [0, 1], x: [-8, 0] }}
                      transition={{ duration: 0.5, delay: 0.6, repeat: Infinity, repeatDelay: 4.5 }}
                      className="rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] p-3"
                    >
                      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Faixa Atual</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#2563eb] to-[#1a3a8a] border border-blue-400/20" />
                          <span className="text-xs font-bold text-white">Azul · 2º Grau</span>
                        </div>
                        <span className="text-[10px] text-white/30">65%</span>
                      </div>
                      <div className="h-1 rounded-full bg-[rgba(255,255,255,0.06)] mt-1.5 overflow-hidden">
                        <motion.div
                          animate={{ width: ["0%", "65%"] }}
                          transition={{ duration: 1.5, delay: 1 }}
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                        />
                      </div>
                    </motion.div>

                    {/* Stats row */}
                    <motion.div
                      animate={{ opacity: [0, 1], y: [8, 0] }}
                      transition={{ duration: 0.5, delay: 0.9, repeat: Infinity, repeatDelay: 5 }}
                      className="grid grid-cols-3 gap-2"
                    >
                      {[
                        { value: "42", label: "aulas" },
                        { value: "5", label: "dias" },
                        { value: "3º", label: "ranking" },
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] py-2 text-center">
                          <div className="text-sm font-black gradient-gold-text">{stat.value}</div>
                          <div className="text-[8px] text-white/30 uppercase tracking-wider">{stat.label}</div>
                        </div>
                      ))}
                    </motion.div>

                    {/* Nav dots */}
                    <div className="flex justify-center gap-1.5 pt-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ width: i === 0 ? 16 : 4, opacity: i === 0 ? 1 : 0.3 }}
                          className="h-1 rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)]"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Edge glow */}
                <div className="absolute inset-0 rounded-[2.75rem] pointer-events-none ring-1 ring-inset ring-white/[0.03]" />
              </div>
            </div>
          </motion.div>

          {/* Right: Steps */}
          <div className="space-y-8 md:pl-4">
            {steps.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.titleKey}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
                  className="group relative pl-14"
                >
                  {/* Step number indicator */}
                  <div className="absolute left-0 top-0 flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold text-black transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, var(--gold-light), var(--gold))`,
                        boxShadow: `0 4px 20px rgba(201,168,76,0.2)`,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-px flex-1 min-h-[24px] bg-gradient-to-b from-[rgba(201,168,76,0.2)] to-transparent mt-2" />
                    )}
                  </div>

                  <h4 className="text-base font-bold mb-1.5 group-hover:text-[var(--gold)] transition-colors">
                    <span className="text-[var(--gold)] mr-2">0{i + 1}</span>
                    {t(s.titleKey)}
                  </h4>
                  <p className="text-sm text-[var(--white-muted)] leading-relaxed max-w-sm">
                    {t(s.descKey)}
                  </p>

                  {/* Hover glow */}
                  <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-[rgba(201,168,76,0.02)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

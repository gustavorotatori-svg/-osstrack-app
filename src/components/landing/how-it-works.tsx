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
            initial={{ opacity: 0, y: -10, rotate: -3 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-block px-5 py-2 bg-[rgba(201,168,76,0.08)] text-xs text-[var(--gold)] font-semibold uppercase tracking-widest mb-5"
            style={{ clipPath: "polygon(10px 0%, calc(100% - 10px) 0%, 100% 100%, 0% 100%)" }}
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

                {/* Screen — screenshot real com overlay hover mostrando o app ao vivo */}
                <div className="w-full h-full rounded-[2rem] overflow-hidden relative group/screen">
                  <img
                    src="/screenshots/demo-aluno.png"
                    alt="OssTrack App Demo"
                    className="w-full h-full object-cover transition-all duration-700 group-hover/screen:scale-105"
                    style={{ background: "#0a0a0a" }}
                  />
                  {/* Gradient overlay pra legibilidade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.6)] via-transparent to-transparent opacity-0 group-hover/screen:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-semibold text-white/60 opacity-0 group-hover/screen:opacity-100 transition-opacity duration-500">
                    App real · toque para interagir
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

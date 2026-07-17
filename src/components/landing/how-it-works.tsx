"use client"

import { useT } from "@/lib/use-t"
import { motion } from "framer-motion"
import { useState } from "react"
import { SmartphoneIcon, TrendingIcon, AwardIcon } from "@/components/ui/icons"
import { ScreenshotDemo } from "@/app/screenshot/demo/client"

export function HowItWorks() {
  const t = useT("comoFunciona")
  const [showSub, setShowSub] = useState(false)

  const steps = [
    { icon: SmartphoneIcon, titleKey: "passo1", descKey: "passo1Desc" },
    { icon: TrendingIcon, titleKey: "passo2", descKey: "passo2Desc" },
    { icon: AwardIcon, titleKey: "passo3", descKey: "passo3Desc" },
  ]

  return (
    <section id="funciona" className="py-24 px-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(201,168,76,0.015)] to-transparent" />

      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center md:justify-end"
          >
            <div className="relative">
              <div className="absolute -inset-10 bg-gradient-radial from-[rgba(201,168,76,0.06)] to-transparent rounded-full blur-3xl" />

              <div className="relative w-[240px] sm:w-[280px] h-[500px] sm:h-[580px] rounded-[2rem] sm:rounded-[2.75rem] border-2 border-[rgba(201,168,76,0.15)] bg-[#0d0d0d] p-2 sm:p-3 shadow-[0_0_80px_rgba(201,168,76,0.06)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-[#0d0d0d] rounded-b-2xl z-10 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
                  <div className="w-16 h-1.5 rounded-full bg-[#1a1a1a]" />
                </div>

                <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
                  <div className="w-full h-full" style={{ transform: "scale(0.73)", transformOrigin: "top left", width: "calc(100% / 0.73)", height: "calc(100% / 0.73)" }}>
                    <ScreenshotDemo />
                  </div>
                  <div className="absolute inset-0 pointer-events-none" />
                </div>

                <div className="absolute inset-0 rounded-[2.75rem] pointer-events-none ring-1 ring-inset ring-white/[0.03]" />
              </div>
            </div>
          </motion.div>

          <div className="md:pl-4">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold tracking-tight mb-3"
            >
              {t("titulo")}
            </motion.h2>
            <motion.button
              onClick={() => setShowSub((p) => !p)}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors flex items-center gap-1 mb-10"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {showSub ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
              </svg>
              {showSub ? "menos detalhes" : "como funciona?"}
            </motion.button>
            <motion.div
              initial={false}
              animate={showSub ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="text-sm text-[var(--white-muted)] leading-relaxed mb-6">{t("subtitulo")}</p>
            </motion.div>

            <div className="space-y-6">
              {steps.map((s, i) => {
                const Icon = s.icon
                return (
                  <StepCard key={s.titleKey} s={s} i={i} Icon={Icon} t={t} />
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StepCard({ s, i, Icon, t }: { s: { titleKey: string; descKey: string }; i: number; Icon: React.ComponentType<{ className?: string }>; t: (k: string) => string }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
      className="group relative pl-14 cursor-pointer"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((p) => !p)}
    >
      <div className="absolute left-0 top-0 flex flex-col items-center">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold text-black transition-all duration-300 group-hover:scale-110"
          style={{
            background: "linear-gradient(135deg, var(--gold-light), var(--gold))",
            boxShadow: "0 4px 20px rgba(201,168,76,0.2)",
          }}
        >
          <Icon className="w-4 h-4" />
        </div>
        {i < 2 && (
          <div className="w-px flex-1 min-h-[24px] bg-gradient-to-b from-[rgba(201,168,76,0.2)] to-transparent mt-2" />
        )}
      </div>

      <h4 className="text-base font-bold group-hover:text-[var(--gold)] transition-colors">
        <span className="text-[var(--gold)] mr-2">0{i + 1}</span>
        {t(s.titleKey)}
      </h4>

      <motion.p
        className="text-sm text-[var(--white-muted)] leading-relaxed max-w-sm overflow-hidden"
        initial={{ height: 0, opacity: 0, marginTop: 0 }}
        animate={open ? { height: "auto", opacity: 1, marginTop: 6 } : { height: 0, opacity: 0, marginTop: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {t(s.descKey)}
      </motion.p>
    </motion.div>
  )
}

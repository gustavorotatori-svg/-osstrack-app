"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, HelpCircle, Flame, Zap, Trophy, Target, ChevronRight } from "lucide-react"
import { useEscape } from "@/lib/use-escape"
import { useT } from "@/lib/use-t"

type GuideStep = {
  icon: typeof Zap
  title: string
  desc: string
}

function buildSteps(t: (key: string) => string): GuideStep[] {
  return [
    {
      icon: Zap,
      title: t("guideStep1Title"),
      desc: t("guideStep1Desc"),
    },
    {
      icon: Flame,
      title: t("guideStep2Title"),
      desc: t("guideStep2Desc"),
    },
    {
      icon: Trophy,
      title: t("guideStep3Title"),
      desc: t("guideStep3Desc"),
    },
    {
      icon: Target,
      title: t("guideStep4Title"),
      desc: t("guideStep4Desc"),
    },
    {
      icon: Trophy,
      title: t("guideStep5Title"),
      desc: t("guideStep5Desc"),
    },
  ]
}

export function GamificationGuide() {
  const t = useT("gamification")
  const steps = buildSteps(t)
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEscape(() => setOpen(false), open)

  return (
    <>
      <button
        onClick={() => { setOpen(true); setStep(0) }}
        className="fixed bottom-24 right-4 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-[0.97]"
        style={{ background: "var(--gold)", color: "#000" }}
        title={t("guideTooltip")}
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              className="glass-card p-6 w-full max-w-sm mx-auto"
              role="dialog"
              aria-modal="true"
              aria-label={t("guideTooltip")}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="section-header mb-0">{t("guideTitle")}</span>
                <button onClick={() => setOpen(false)} aria-label={t("guideFechar")} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="w-4 h-4" style={{ color: "var(--text-muted)" }} /></button>
              </div>

              <div className="space-y-5 min-h-[200px]">
                {steps.map((s, i) => {
                  const Icon = s.icon
                  if (i !== step) return null
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-center"
                    >
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                        style={{ background: "rgba(212,168,71,0.12)" }}>
                        <Icon className="w-7 h-7" style={{ color: "var(--gold)" }} />
                      </div>
                      <h3 className="font-bold text-base mb-1">{s.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{s.desc}</p>
                    </motion.div>
                  )
                })}

                {/* Dots */}
                <div className="flex items-center justify-center gap-1.5 pt-2">
                  {steps.map((_, i) => (
                    <button key={i} onClick={() => setStep(i)}
                      aria-label={t("guidePasso").replace("{n}", String(i + 1)).replace("{total}", String(steps.length))}
                      className={`w-3 h-3 rounded-full transition-all ${i === step ? "w-6" : ""}`}
                      style={{ background: i === step ? "var(--gold)" : "var(--border)" }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {step > 0 && (
                  <button onClick={() => setStep(step - 1)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
                    style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                    {t("guideAnterior")}
                  </button>
                )}
                {step < steps.length - 1 ? (
                  <button onClick={() => setStep(step + 1)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                    style={{ background: "var(--gold)", color: "#000" }}>
                    {t("guideProximo")} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button onClick={() => setOpen(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold"
                    style={{ background: "var(--gold)", color: "#000" }}>
                    {t("guideEntendi")}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

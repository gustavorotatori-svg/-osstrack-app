"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { GiIcon, CrownIcon, SparklesIcon, TargetIcon } from "@/components/ui/icons"
import { useEscape } from "@/lib/use-escape"
import { useT } from "@/lib/use-t"

type TourStep = {
  icon: React.ReactNode
  color: string
  title: string
  desc: string
  action: string
  href: string
}

function buildSteps(t: (key: string) => string): TourStep[] {
  return [
    {
      icon: <GiIcon className="w-8 h-8" />,
      color: "#60a5fa",
      title: t("interactiveTourStep1Title"),
      desc: t("interactiveTourStep1Desc"),
      action: t("interactiveTourStep1Acao"),
      href: "/dashboard/aluno/checkin",
    },
    {
      icon: <CrownIcon className="w-8 h-8" />,
      color: "var(--gold)",
      title: t("interactiveTourStep2Title"),
      desc: t("interactiveTourStep2Desc"),
      action: t("interactiveTourStep2Acao"),
      href: "/dashboard/aluno",
    },
    {
      icon: <TargetIcon className="w-8 h-8" />,
      color: "#a855f7",
      title: t("interactiveTourStep3Title"),
      desc: t("interactiveTourStep3Desc"),
      action: t("interactiveTourStep3Acao"),
      href: "/dashboard/aluno",
    },
    {
      icon: <SparklesIcon className="w-8 h-8" />,
      color: "#f97316",
      title: t("interactiveTourStep4Title"),
      desc: t("interactiveTourStep4Desc"),
      action: t("interactiveTourStep4Acao"),
      href: "/dashboard/aluno/conquistas",
    },
  ]
}

export function InteractiveTour({ onFinish }: { onFinish: () => void }) {
  const t = useT("onboarding")
  const [step, setStep] = useState(0)
  const router = useRouter()
  const STEPS = buildSteps(t)

  useEscape(skip, true)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  async function markTourComplete() {
    try {
      localStorage.setItem("oss_tour_done", "true")
      localStorage.setItem("osstrack_tour_aluno", "true")
      await fetch("/api/tour", { method: "PATCH" })
    } catch {}
  }

  function handleAction() {
    router.push(current.href)
    if (isLast) {
      markTourComplete()
      onFinish()
    } else {
      setStep(step + 1)
    }
  }

  function skip() {
    markTourComplete()
    onFinish()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={skip} />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="relative z-10 glass-card p-6 max-w-sm w-full text-center"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: `${current.color}15`, color: current.color }}
          >
            {current.icon}
          </div>

          <h3 className="text-lg font-black mb-2">{current.title}</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">{current.desc}</p>

          <div className="flex items-center justify-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 24 : 6,
                  background: i === step ? "var(--gold)" : "rgba(255,255,255,0.1)",
                }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={skip} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[var(--text-muted)] hover:text-white transition-colors">
              {t("interactiveTourPular")}
            </button>
            <button onClick={handleAction} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[var(--gold)] text-black hover:shadow-lg hover:shadow-[var(--gold)]/20 transition-all active:scale-95">
              {current.action}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
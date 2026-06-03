"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useT } from "@/lib/use-t"
import { DumbbellIcon, GraduationIcon, CrownIcon, MapPinIcon, TrendingIcon, AwardIcon, SmartphoneIcon, ClipboardIcon, UsersIcon, CalendarIcon, ChartIcon } from "@/components/ui/icons"

const iconsMap: Record<string, React.ReactNode> = {
  "🥋": <DumbbellIcon className="w-8 h-8" />,
  "👨‍🏫": <GraduationIcon className="w-8 h-8" />,
  "👑": <CrownIcon className="w-8 h-8" />,
  "📍": <MapPinIcon className="w-5 h-5" />,
  "📈": <TrendingIcon className="w-5 h-5" />,
  "🏆": <AwardIcon className="w-5 h-5" />,
  "📱": <SmartphoneIcon className="w-5 h-5" />,
  "📋": <ClipboardIcon className="w-5 h-5" />,
  "👥": <UsersIcon className="w-5 h-5" />,
  "📅": <CalendarIcon className="w-5 h-5" />,
  "📊": <ChartIcon className="w-5 h-5" />,
}

function buildTours(tBase: (key: string) => string) {
  return {
    aluno: {
      title: tBase("aluno.title"),
      icon: iconsMap["🥋"],
      steps: [
        { icon: iconsMap["📍"], title: tBase("aluno.step1Title"), desc: tBase("aluno.step1Desc"), action: "/dashboard/aluno/checkin" },
        { icon: iconsMap["📈"], title: tBase("aluno.step2Title"), desc: tBase("aluno.step2Desc"), action: "/dashboard/aluno/evolucao" },
        { icon: iconsMap["🏆"], title: tBase("aluno.step3Title"), desc: tBase("aluno.step3Desc"), action: "/dashboard/aluno/conquistas" },
        { icon: iconsMap["📱"], title: tBase("aluno.step4Title"), desc: tBase("aluno.step4Desc"), action: "/dashboard/aluno/compartilhar" },
      ],
    },
    professor: {
      title: tBase("professor.title"),
      icon: iconsMap["👨‍🏫"],
      steps: [
        { icon: iconsMap["📋"], title: tBase("professor.step1Title"), desc: tBase("professor.step1Desc"), action: "/dashboard/professor/presencas" },
        { icon: iconsMap["👥"], title: tBase("professor.step2Title"), desc: tBase("professor.step2Desc"), action: "/dashboard/professor/alunos" },
        { icon: iconsMap["📅"], title: tBase("professor.step3Title"), desc: tBase("professor.step3Desc"), action: "/dashboard/professor/turmas" },
      ],
    },
    dono: {
      title: tBase("dono.title"),
      icon: iconsMap["👑"],
      steps: [
        { icon: iconsMap["📊"], title: tBase("dono.step1Title"), desc: tBase("dono.step1Desc"), action: "/dashboard/dono" },
        { icon: iconsMap["👥"], title: tBase("dono.step2Title"), desc: tBase("dono.step2Desc"), action: "/dashboard/dono/alunos" },
        { icon: iconsMap["🥋"], title: tBase("dono.step3Title"), desc: tBase("dono.step3Desc"), action: "/dashboard/dono/graduacoes" },
        { icon: iconsMap["📈"], title: tBase("dono.step4Title"), desc: tBase("dono.step4Desc"), action: "/dashboard/dono/relatorios" },
      ],
    },
  }
}

export function OnboardingTour({ role, onComplete }: { role: string; onComplete: () => void }) {
  const tBase = useT("onboarding")
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(true)
  const router = useRouter()
  const tours = buildTours(tBase)
  const t = tours[role as keyof typeof tours]
  if (!t) return null

  const current = t.steps[step]

  function next() {
    if (step < t.steps.length - 1) setStep(step + 1)
    else finish()
  }

  function finish() {
    setVisible(false)
    onComplete()
  }

  function goToAction() {
    if (current.action) { finish(); router.push(current.action) }
    else next()
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[var(--dark-card)] border border-[var(--gold)]/30 rounded-2xl p-6 max-w-sm w-full animate-slide-up shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            {t.steps.map((_: unknown, i: number) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-[var(--gold)]" : "w-1.5 bg-[var(--dark-border)]"}`} />
            ))}
          </div>
          <button onClick={finish} className="text-xs text-[var(--white-muted)] hover:text-white transition-colors">
            {tBase("pularTour")}
          </button>
        </div>

        <div className="text-center mb-6">
          {step === 0 ? (
            <>
              <div className="text-5xl mb-3">{t.icon}</div>
              <h3 className="text-xl font-extrabold mb-2">{t.title}</h3>
              <p className="text-sm text-[var(--white-muted)]">{tBase("passosIntro").replace("{n}", String(t.steps.length))}</p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-3">{current.icon}</div>
              <h4 className="text-base font-bold mb-2">{current.title}</h4>
              <p className="text-sm text-[var(--white-muted)] leading-relaxed">{current.desc}</p>
            </>
          )}
        </div>

        <button onClick={goToAction} className="w-full py-3 rounded-lg font-bold text-sm gradient-gold text-black mb-2">
          {current.action ? tBase("irParaTela") : step < t.steps.length - 1 ? tBase("proximo") : tBase("comecar")}
        </button>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="w-full py-2 rounded-lg font-semibold text-xs text-[var(--white-muted)] hover:text-white transition-colors">
            {tBase("voltar")}
          </button>
        )}
      </div>
    </div>
  )
}

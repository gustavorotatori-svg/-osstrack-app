"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const tours: Record<string, { title: string; icon: string; steps: { icon: string; title: string; desc: string; action?: string }[] }> = {
  aluno: {
    title: "Bem-vindo ao OssTrack!",
    icon: "🥋",
    steps: [
      { icon: "📍", title: "Faça Check-in", desc: "Chegou na academia? Abra o app e faça check-in. Só funciona dentro do raio permitido.", action: "/dashboard/aluno/checkin" },
      { icon: "📈", title: "Acompanhe sua Evolução", desc: "Veja quantas aulas faltam para seu próximo grau e próxima faixa.", action: "/dashboard/aluno/evolucao" },
      { icon: "🏆", title: "Ganhe Conquistas", desc: "Streaks, medalhas e conquistas. Treine consistentemente e desbloqueie todas!", action: "/dashboard/aluno/conquistas" },
      { icon: "📱", title: "Compartilhe", desc: "Ganhou um grau novo? Compartilhe com arte automática no Instagram.", action: "/dashboard/aluno/compartilhar" },
    ],
  },
  professor: {
    title: "Bem-vindo, Professor!",
    icon: "👨‍🏫",
    steps: [
      { icon: "📋", title: "Confirme Presenças", desc: "Veja quem fez check-in e confirme as presenças dos seus alunos.", action: "/dashboard/professor/presencas" },
      { icon: "👥", title: "Gerencie seus Alunos", desc: "Acompanhe o progresso de cada aluno e veja quem está próximo de graduar.", action: "/dashboard/professor/alunos" },
      { icon: "📅", title: "Suas Turmas", desc: "Visualize suas turmas, horários e alunos matriculados.", action: "/dashboard/professor/turmas" },
    ],
  },
  dono: {
    title: "Bem-vindo, Mestre!",
    icon: "👑",
    steps: [
      { icon: "📊", title: "Dashboard", desc: "Visão geral da sua academia: alunos, frequência, métricas.", action: "/dashboard/dono" },
      { icon: "👥", title: "Alunos", desc: "Gerencie toda a equipe e acompanhe o progresso individual.", action: "/dashboard/dono/alunos" },
      { icon: "🥋", title: "Graduações", desc: "Defina regras de evolução: aulas por grau, faixas, categorias.", action: "/dashboard/dono/graduacoes" },
      { icon: "📈", title: "Relatórios", desc: "Acompanhe retenção, frequência e crescimento da academia.", action: "/dashboard/dono/relatorios" },
    ],
  },
}

export function OnboardingTour({ role, onComplete }: { role: string; onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(true)
  const router = useRouter()
  const t = tours[role]
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
    if (current.action) router.push(current.action)
    else next()
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[var(--dark-card)] border border-[var(--gold)]/30 rounded-2xl p-6 max-w-sm w-full animate-slide-up shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            {t.steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-[var(--gold)]" : "w-1.5 bg-[var(--dark-border)]"}`} />
            ))}
          </div>
          <button onClick={finish} className="text-xs text-[var(--white-muted)] hover:text-white transition-colors">
            Pular tour
          </button>
        </div>

        <div className="text-center mb-6">
          {step === 0 ? (
            <>
              <div className="text-5xl mb-3">{t.icon}</div>
              <h3 className="text-xl font-extrabold mb-2">{t.title}</h3>
              <p className="text-sm text-[var(--white-muted)]">Vamos te mostrar os principais recursos em {t.steps.length} passos.</p>
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
          {current.action ? "Ir para esta tela" : step < t.steps.length - 1 ? "Próximo" : "Começar!"}
        </button>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="w-full py-2 rounded-lg font-semibold text-xs text-[var(--white-muted)] hover:text-white transition-colors">
            Voltar
          </button>
        )}
      </div>
    </div>
  )
}

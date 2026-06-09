"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Target, TrendingUp } from "lucide-react"
import { useT } from "@/lib/use-t"

type WeeklyGoal = {
  id: string
  titulo: string
  descricao: string
  xp: number
  concluida: boolean
  progresso: number
  total: number
}

export function MetaSemanalCard() {
  const t = useT("gamification.metaSemanal")
  const [goals, setGoals] = useState<WeeklyGoal[]>([])

  useEffect(() => {
    fetch("/api/meta-semanal").then(r => r.json()).then(setGoals).catch(() => {})
  }, [])

  return (
    <div className="tech-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--gold)]" />
            <span className="section-header mb-0">{t("titulo")}</span>
          </div>
          <span className="badge">{t("semanal")}</span>
        </div>
        <div className="space-y-2">
          {goals.map((g) => (
            <div
              key={g.id}
              className={`relative overflow-hidden rounded-xl border p-3.5 transition-all ${
                g.concluida ? "border-emerald-500/30 bg-emerald-500/5" : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  g.concluida ? "bg-emerald-500/20 text-emerald-400" : "bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)]"
                }`}>
                  {g.concluida ? <CheckCircle className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold text-sm ${g.concluida ? "text-emerald-400 line-through" : ""}`}>{g.titulo}</span>
                    <span className="text-[10px] font-bold text-[var(--gold)]">+{g.xp}XP</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{g.descricao}</p>
                  <div className="mt-2 progress">
                    <div className="progress-gold" style={{ width: `${(g.progresso / g.total) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
  )
}

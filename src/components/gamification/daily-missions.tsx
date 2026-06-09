"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Zap, Target } from "lucide-react"
import { PremiumLock } from "@/components/ui/premium-lock"
import { PremiumBanner } from "@/components/ui/premium-lock"
import { usePremium } from "@/lib/use-premium"
import { useT } from "@/lib/use-t"

type Mission = {
  id: string
  titulo: string
  descricao: string
  xp: number
  concluida: boolean
  progresso: number
  total: number
  icone: string
}

export function DailyMissions() {
  const t = useT("gamification.missoes")
  const { isPremium, loading } = usePremium()
  const [missions, setMissions] = useState<Mission[]>([])

  useEffect(() => {
    fetch("/api/missoes").then(r => r.json()).then(data => setMissions(data.missoes ?? [])).catch(() => {})
  }, [])

  if (loading) return null

  return (
    <PremiumLock isLocked={!isPremium} featureName="Missões Diárias">
      <div className="tech-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[var(--gold)]" />
            <span className="section-header mb-0">{t("titulo")}</span>
          </div>
          <span className="badge">{missions.filter(m => m.concluida).length}/{missions.length}</span>
        </div>
        <div className="space-y-2">
          {missions.map((m) => (
            <div
              key={m.id}
              className={`relative overflow-hidden rounded-xl border p-3.5 transition-all ${
                m.concluida ? "border-emerald-500/30 bg-emerald-500/5" : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  m.concluida ? "bg-emerald-500/20 text-emerald-400" : "bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)]"
                }`}>
                  {m.concluida ? <CheckCircle className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold text-sm ${m.concluida ? "text-emerald-400 line-through" : ""}`}>{m.titulo}</span>
                    <span className="text-[10px] font-bold text-[var(--gold)]">+{m.xp}XP</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{m.descricao}</p>
                  <div className="mt-2 progress">
                    <div
                      className={`progress-fill ${m.concluida ? "bg-emerald-500" : "progress-fill-gold"}`}
                      style={{ width: `${(m.progresso / m.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PremiumLock>
  )
}

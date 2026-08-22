"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Target, TrendingUp } from "lucide-react"
import { useT } from "@/lib/use-t"

export function MetaSemanalCard() {
  const t = useT("gamification.progressoSemanal")
  const [meta, setMeta] = useState<{ aulasFeitas: number; aulasAlvo: number; concluida: boolean } | null>(null)

  useEffect(() => {
    fetch("/api/metasemanal").then(r => r.json()).then(setMeta).catch((e) => console.error("meta semanal", e))
  }, [])

  if (!meta) return null

  const progresso = Math.min(meta.aulasFeitas / meta.aulasAlvo, 1)

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[var(--gold)]" />
          <span className="section-header mb-0">{t("titulo")}</span>
        </div>
        <span className="badge">{t("semanal")}</span>
      </div>

      <div className={`relative overflow-hidden rounded-xl border p-3.5 transition-all ${meta.concluida ? "border-emerald-500/30 bg-emerald-500/5" : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"}`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${meta.concluida ? "bg-emerald-500/20 text-emerald-400" : "bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)]"}`}>
            {meta.concluida ? <CheckCircle className="w-4 h-4" /> : <Target className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={`font-semibold text-sm ${meta.concluida ? "text-emerald-400 line-through" : ""}`}>
                {meta.aulasFeitas}/{meta.aulasAlvo} aulas
              </span>
            </div>
            <div className="mt-2 progress">
              <div className="progress-gold" style={{ width: `${progresso * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

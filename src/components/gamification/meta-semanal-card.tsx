"use client"

import { useState, useEffect } from "react"
import { useT } from "@/lib/use-t"
import { TargetIcon, CheckIcon, AwardIcon } from "@/components/ui/icons"

export function MetaSemanalCard() {
  const t = useT("gamification")
  const [data, setData] = useState({ aulasFeitas: 0, aulasAlvo: 5, concluida: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/metasemanal")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null

  const progresso = data.aulasAlvo > 0 ? (data.aulasFeitas / data.aulasAlvo) * 100 : 0
  const restam = Math.max(0, data.aulasAlvo - data.aulasFeitas)

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-base tracking-tight flex items-center gap-1.5">
          <TargetIcon className="w-4 h-4 text-[var(--gold)]" /> {t("metaSemanal.title")}
        </h3>
        {data.concluida && <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5"><CheckIcon className="w-3 h-3" /> {t("metaSemanal.concluida")}</span>}
      </div>
      <div className="flex items-end justify-between mb-2">
        <div className="text-3xl font-extrabold text-[var(--gold)]">
          {data.aulasFeitas}<span className="text-lg text-[var(--white-muted)]">/{data.aulasAlvo}</span>
        </div>
        <div className="text-xs text-[var(--white-muted)] flex items-center gap-1">
          {data.concluida ? <><AwardIcon className="w-3.5 h-3.5 text-[var(--gold)]" /> {t("metaSemanal.metaBatida")}</> : t("metaSemanal.faltamTreinos")}
        </div>
      </div>
      <div className="progress-gold">
        <div className="progress-gold-fill" style={{ width: `${Math.min(100, progresso)}%` }} />
      </div>
      <div className="flex justify-between text-sm text-[var(--white-muted)] mt-2">
        <span>{t("metaSemanal.treinosEssaSemana")}</span>
        <span className="text-[var(--gold)] font-bold">{Math.round(progresso)}%</span>
      </div>
    </div>
  )
}

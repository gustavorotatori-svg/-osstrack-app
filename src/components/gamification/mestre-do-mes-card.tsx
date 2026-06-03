"use client"

import { useState, useEffect } from "react"
import { useT } from "@/lib/use-t"
import { CrownIcon } from "@/components/ui/icons"

type MestreData = {
  nome: string
  faixa: string
  avatar: string | null
  totalAulas: number
  mes: number
  ano: number
} | null

export function MestreDoMesCard() {
  const t = useT("gamification")
  const [mestre, setMestre] = useState<MestreData>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/mestredomes/meu")
      .then((r) => r.json())
      .then((d) => { setMestre(d.mestre); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null

  const nomeMes = Array.from({ length: 12 }, (_, i) => t(`mestreDoMes.meses.${i}`))

  return (
    <div className="glass-card-gold text-center relative overflow-hidden">
      <div className="absolute top-[-30px] right-[-30px] w-32 h-32 bg-[var(--gold)]/8 rounded-full blur-3xl" />
      <div className="relative">
        <CrownIcon className="w-8 h-8 mx-auto mb-1 text-[var(--gold)]" />
        <h3 className="font-bold text-base tracking-tight">{t("mestreDoMes.title")}</h3>
        {mestre ? (
          <>
            <p className="text-2xl font-extrabold text-[var(--gold)] mt-2">{mestre.nome}</p>
            <p className="text-xs text-[var(--white-muted)]">{mestre.faixa} · {mestre.totalAulas} aulas</p>
            <p className="text-[10px] text-[var(--gray)] mt-1">{nomeMes[mestre.mes - 1]} de {mestre.ano}</p>
          </>
        ) : (
          <p className="text-sm text-[var(--white-muted)] mt-2">{t("mestreDoMes.semMestre")}</p>
        )}
      </div>
    </div>
  )
}

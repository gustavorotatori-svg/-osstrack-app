"use client"

import { useState, useEffect } from "react"
import { Celebration } from "@/components/ui/celebration"
import { useT } from "@/lib/use-t"
import { TargetIcon, StarIcon, CalendarIcon, AwardIcon, CheckIcon } from "@/components/ui/icons"

type Missao = {
  id: string
  dia: number
  titulo: string
  descricao: string
  icone: string
  tipo: "onboarding" | "diaria" | "semanal"
  concluida: boolean
  pontos: number
}

const tipoIconMap: Record<string, React.ReactNode> = {
  onboarding: <TargetIcon className="w-3.5 h-3.5" />,
  diaria: <StarIcon className="w-3.5 h-3.5" />,
  semanal: <CalendarIcon className="w-3.5 h-3.5" />,
}

const tipoTKeys: Record<string, string> = {
  onboarding: "dailyMissions.jornadaInicial",
  diaria: "dailyMissions.diarias",
  semanal: "dailyMissions.semanais",
}

export function DailyMissions() {
  const t = useT("gamification")
  const [missoes, setMissoes] = useState<Missao[]>([])
  const [pontos, setPontos] = useState(0)
  const [loading, setLoading] = useState(true)
  const [celebrate, setCelebrate] = useState(false)

  useEffect(() => {
    fetch("/api/missoes")
      .then((r) => r.json())
      .then((data: { missoes: Missao[]; pontos: number }) => {
        setMissoes(data.missoes)
        setPontos(data.pontos)
        const todas = data.missoes.length > 0 && data.missoes.every((m) => m.concluida)
        if (todas) setCelebrate(true)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null

  const grupos = ["onboarding", "diaria", "semanal"]
    .map((tipo) => ({
      tipo,
      icon: tipoIconMap[tipo],
      label: t(tipoTKeys[tipo]),
      missoes: missoes.filter((m) => m.tipo === tipo),
    }))
    .filter((g) => g.missoes.length > 0)

  const todasCompletas = missoes.length > 0 && missoes.every((m) => m.concluida)

  return (
    <>
      <Celebration show={celebrate} title={t("dailyMissions.todasCompletas")} onDone={() => setCelebrate(false)} />
      <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
            {todasCompletas ? <AwardIcon className="w-4 h-4 text-[var(--gold)]" /> : <TargetIcon className="w-4 h-4 text-[var(--gold)]" />}
            {todasCompletas ? t("dailyMissions.todasCompletas") : t("dailyMissions.title")}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--gold)] font-semibold flex items-center gap-0.5"><StarIcon className="w-3 h-3" /> {pontos} {t("dailyMissions.pontos")}</span>
          </div>
        </div>

        {todasCompletas ? (
          <div className="text-center py-6">
            <AwardIcon className="w-10 h-10 mx-auto mb-2 text-[var(--gold)] animate-float" />
            <p className="text-sm gradient-gold-text font-bold">Você completou todas as missões!</p>
            <p className="text-xs text-[var(--white-muted)] mt-1.5">Continue treinando — amanhã tem mais!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grupos.map((grupo) => {
              const concluidas = grupo.missoes.filter((m) => m.concluida).length
              const total = grupo.missoes.length
              return (
                <div key={grupo.tipo}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[var(--white-muted)] flex items-center gap-1">
                      {grupo.icon} {grupo.label}
                    </span>
                    <span className="text-[10px] text-[var(--gray)]">{concluidas}/{total}</span>
                  </div>
                  {grupo.tipo !== "onboarding" && (
                    <div className="w-full bg-[var(--dark-border)] rounded-full h-1.5 mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(concluidas / total) * 100}%`, background: "linear-gradient(90deg, var(--gold), #e8c84a)" }}
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {grupo.missoes.map((m) => (
                      <div
                        key={m.id}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                          m.concluida ? "bg-emerald-500/8 opacity-60" : "bg-[var(--dark-border)]/30"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                          m.concluida ? "bg-emerald-500/15" : "bg-[rgba(201,168,76,0.1)]"
                        }`}>
                          {m.concluida ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : <span>{m.icone}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold truncate ${m.concluida ? "line-through text-[var(--white-muted)]" : ""}`}>
                            {m.titulo}
                          </div>
                          <div className="text-[11px] text-[var(--white-muted)] truncate">{m.descricao}</div>
                        </div>
                        {!m.concluida && m.pontos > 0 && (
                          <span className="text-[10px] text-[var(--gold)] font-semibold shrink-0 flex items-center gap-0.5">+{m.pontos}<StarIcon className="w-2.5 h-2.5" /></span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

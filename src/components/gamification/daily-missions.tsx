"use client"

import { useState, useEffect } from "react"

type Missao = {
  id: string
  dia: number
  titulo: string
  descricao: string
  icone: string
  concluida: boolean
}

export function DailyMissions() {
  const [missoes, setMissoes] = useState<Missao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/missoes")
      .then((r) => r.json())
      .then((data) => { setMissoes(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null

  const concluidas = missoes.filter((m) => m.concluida).length
  const total = missoes.length
  const todasCompletas = concluidas === total

  return (
    <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold">{todasCompletas ? "🏅 Missões Completas!" : "🎯 Missões Diárias"}</h3>
        <span className="text-xs text-[var(--gold)] font-semibold">{concluidas}/{total}</span>
      </div>
      {todasCompletas ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-sm text-[var(--gold)] font-semibold">Você completou todas as missões!</p>
          <p className="text-xs text-[var(--white-muted)] mt-1">Sua jornada no Jiu-Jitsu começou com tudo!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {missoes.map((m) => (
            <div
              key={m.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                m.concluida ? "bg-emerald-500/10 opacity-60" : "bg-[var(--dark-border)]/50"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base ${
                m.concluida ? "bg-emerald-500/20" : "bg-[rgba(201,168,76,0.15)]"
              }`}>
                {m.concluida ? "✅" : m.icone}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-semibold ${m.concluida ? "line-through text-[var(--white-muted)]" : ""}`}>
                  Dia {m.dia}: {m.titulo}
                </div>
                <div className="text-[11px] text-[var(--white-muted)]">{m.descricao}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

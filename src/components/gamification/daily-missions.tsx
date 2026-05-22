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
    <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="font-bold text-sm tracking-tight">
          {todasCompletas ? "🏅 Jornada Completa!" : "🎯 Missões de Onboarding"}
        </h3>
        <span className="badge-gold text-[10px]">{concluidas}/{total}</span>
      </div>
      {todasCompletas ? (
        <div className="text-center py-6">
          <div className="text-4xl mb-2 animate-float">🎉</div>
          <p className="text-sm gradient-gold-text font-bold">Você completou todas as missões!</p>
          <p className="text-xs text-[var(--white-muted)] mt-1.5">Sua jornada no Jiu-Jitsu começou com tudo!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {missoes.map((m) => (
            <div
              key={m.id}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all ${
                m.concluida ? "bg-emerald-500/8 opacity-60" : "bg-[var(--dark-border)]/30"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                m.concluida ? "bg-emerald-500/15" : "bg-[rgba(201,168,76,0.1)]"
              }`}>
                {m.concluida ? "✅" : m.icone}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold truncate ${m.concluida ? "line-through text-[var(--white-muted)]" : ""}`}>
                  Dia {m.dia}: {m.titulo}
                </div>
                <div className="text-[11px] text-[var(--white-muted)] truncate">{m.descricao}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

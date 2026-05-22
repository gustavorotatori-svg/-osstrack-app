"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"

type Props = {
  ranking: { id: string; nome: string; faixa: string; grau: number; totalAulas: number }[]
  alunoId: string
  belts: string[]
  mestre: { nome: string; faixa: string; grau: number; totalAulas: number } | null
}

export function RankingClient({ ranking, alunoId, belts, mestre }: Props) {
  const [beltFilter, setBeltFilter] = useState("Todas")
  const myPos = ranking.findIndex((a) => a.id === alunoId)
  const filtered = beltFilter === "Todas" ? ranking : ranking.filter((a) => a.faixa === beltFilter)
  const myPosFiltered = filtered.findIndex((a) => a.id === alunoId)
  const firstInFiltered = filtered[0]

  return (
    <DashboardShell role="aluno">
      <div className="space-y-4">
        {mestre && (
          <div className="bg-gradient-to-br from-[rgba(201,168,76,0.1)] to-[rgba(201,168,76,0.02)] border border-[var(--gold)]/20 rounded-2xl p-5 text-center relative overflow-hidden animate-pulse-glow">
            <div className="absolute top-[-10px] right-[-10px] text-7xl opacity-[0.06]">👑</div>
            <div className="text-3xl mb-1 animate-float">👑</div>
            <h3 className="font-bold text-sm text-[var(--gold)] uppercase tracking-widest">Mestre do Mês</h3>
            <div className="w-12 h-[1px] bg-[var(--gold)]/30 mx-auto my-3" />
            <p className="text-lg font-extrabold mt-0.5">{mestre.nome}</p>
            <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold mt-2 ${getBeltColor(mestre.faixa)}`}>
              {getBeltEmoji(mestre.faixa)} {mestre.faixa} · {mestre.grau + 1}º Grau
            </span>
            <p className="text-xs text-[var(--white-muted)] mt-2">{mestre.totalAulas} aulas no mês</p>
          </div>
        )}

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 text-center hover-card">
          <div className="text-3xl mb-2">🏆</div>
          <h3 className="font-bold">Ranking da Academia</h3>
          <p className="text-xs text-[var(--white-muted)]">Veja sua posição entre os alunos</p>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {["Todas", ...belts].map((b) => (
            <button
              key={b}
              onClick={() => setBeltFilter(b)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                beltFilter === b
                  ? "gradient-gold text-black shadow-md"
                  : "bg-[var(--dark-card)] border border-[var(--dark-border)] text-[var(--white-muted)] hover:border-[var(--gold)]/30"
              }`}
            >
              {b === "Todas" ? "📋 Todas" : `${getBeltEmoji(b)} ${b}`}
            </button>
          ))}
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl overflow-hidden">
          {filtered.map((a, i) => {
            const isMe = a.id === alunoId
            return (
              <div
                key={a.id}
                className={`flex items-center gap-3.5 px-4 py-3 border-b border-[var(--dark-border)] last:border-0 transition-all ${
                  isMe ? "bg-[rgba(201,168,76,0.06)]" : "hover:bg-[var(--dark-border)]/30"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                  i === 0 ? "gradient-gold text-black shadow-md"
                  : i === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-black"
                  : i === 2 ? "bg-gradient-to-br from-amber-700 to-amber-800 text-white"
                  : "bg-[var(--dark-border)] text-[var(--white-muted)]"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {mestre && mestre.nome === a.nome && <span className="mr-1">👑</span>}
                    {isMe && <span className="mr-1">👉</span>}
                    {a.nome}
                  </div>
                  <div className="text-[11px] text-[var(--white-muted)] flex items-center gap-1.5">
                    <span className={getBeltColor(a.faixa).split(" ")[0] + " w-2.5 h-2.5 rounded-full inline-block"} />
                    {a.faixa} · {'★'.repeat(a.grau + 1)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-[var(--gold)]">{a.totalAulas}</div>
                  <div className="text-[9px] text-[var(--gray)]">aulas</div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 text-center">
          {myPosFiltered >= 0 ? (
            <>
              <p className="text-xs text-[var(--white-muted)]">
                🔥 Você está na <strong className="text-[var(--gold)]">{myPosFiltered + 1}ª</strong> posição
                {beltFilter !== "Todas" && <span> na faixa {beltFilter}</span>}
              </p>
              {myPosFiltered > 0 && firstInFiltered && (
                <p className="text-xs text-[var(--gold)] mt-1.5">
                  Faltam {firstInFiltered.totalAulas - filtered[myPosFiltered].totalAulas} aulas para alcançar o 1º lugar!
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-[var(--white-muted)]">Você não está no ranking desta faixa</p>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}

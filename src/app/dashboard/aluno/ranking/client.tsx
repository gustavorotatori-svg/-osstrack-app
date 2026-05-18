"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"

type Props = {
  ranking: { id: string; nome: string; faixa: string; grau: number; totalAulas: number }[]
  alunoId: string
}

export function RankingClient({ ranking, alunoId }: Props) {
  const myPos = ranking.findIndex((a) => a.id === alunoId)

  return (
    <DashboardShell role="aluno">
      <div className="animate-fade-in space-y-4">
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 text-center">
          <div className="text-3xl mb-2">🏆</div>
          <h3 className="font-bold">Ranking da Academia</h3>
          <p className="text-xs text-[var(--white-muted)]">Veja sua posição</p>
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl px-3 py-2">
          {ranking.map((a, i) => {
            const isMe = a.id === alunoId
            return (
              <div
                key={a.id}
                className={`flex items-center gap-3 py-2.5 border-b border-[var(--dark-border)] last:border-0 ${
                  isMe ? "bg-[rgba(201,168,76,0.08)] rounded-lg px-2 -mx-2" : ""
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i === 0 ? "bg-[var(--gold)] text-black" : i === 1 ? "bg-gray-400 text-black" : i === 2 ? "bg-amber-800 text-white" : "bg-[var(--dark-border)] text-[var(--white-muted)]"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">
                    {isMe && "👉 "}{a.nome}
                  </div>
                  <div className="text-[11px] text-[var(--white-muted)]">
                    {getBeltEmoji(a.faixa)} {a.faixa} {'★'.repeat(a.grau + 1)}
                  </div>
                </div>
                <div className="text-sm font-bold text-[var(--gold)]">{a.totalAulas}</div>
              </div>
            )
          })}
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 text-center">
          <p className="text-xs text-[var(--white-muted)]">
            🔥 Você está na <strong className="text-[var(--gold)]">{myPos + 1}ª</strong> posição
          </p>
          {myPos > 0 && (
            <p className="text-xs text-[var(--gold)] mt-1">
              Faltam {ranking[0].totalAulas - ranking[myPos].totalAulas} aulas para alcançar o 1º lugar!
            </p>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}

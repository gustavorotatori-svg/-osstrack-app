"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { getBeltEmoji } from "@/lib/utils"

type Props = {
  aluno: { nome: string; faixa: string; grau: number; totalAulas: number }
  graduacoes: { faixa: string; graus: number; aulasPorGrau: number; aulasProxFx: number | null }[]
}

export function EvolutionClient({ aluno, graduacoes }: Props) {
  const beltIndex = graduacoes.findIndex((g) => g.faixa === aluno.faixa)

  return (
    <DashboardShell role="aluno">
      <div className="animate-fade-in space-y-4">
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 text-center">
          <h3 className="font-bold mb-1">Sua Jornada</h3>
          <p className="text-xs text-[var(--white-muted)]">&ldquo;Da faixa branca à preta.&rdquo;</p>
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <h3 className="font-bold mb-4">🥋 Progressão de Faixas</h3>
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-[var(--dark-border)]" />
            {graduacoes.map((g, i) => {
              const isCurrent = i === beltIndex
              const isPast = i < beltIndex
              const totalClassesNeeded = g.aulasProxFx || 999
              const progress = isCurrent ? Math.min(100, (aluno.totalAulas / totalClassesNeeded) * 100) : isPast ? 100 : 0
              return (
                <div key={g.faixa} className="relative pb-6 last:pb-0">
                  <div className={`absolute left-[-16px] top-1 w-3 h-3 rounded-full border-2 border-black ${
                    isCurrent ? "bg-white shadow-[0_0_0_4px_rgba(201,168,76,0.2)]" : isPast ? "bg-[var(--gold)]" : "bg-[var(--dark-border)]"
                  }`} />
                  <div className="text-sm font-semibold">
                    {getBeltEmoji(g.faixa)} {g.faixa}
                    {isCurrent && <span className="text-[var(--gold)] text-xs ml-2">· Você está aqui</span>}
                    {isPast && <span className="text-emerald-500 text-xs ml-2">✓</span>}
                  </div>
                  <div className="text-xs text-[var(--white-muted)]">{g.graus} graus · {g.aulasPorGrau} aulas/grau</div>
                  {isCurrent && (
                    <div className="mt-2">
                      <div className="h-2 bg-[var(--dark-border)] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[var(--gold)] to-yellow-300 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-[var(--white-muted)] mt-0.5">
                        <span>{aluno.totalAulas} de {totalClassesNeeded} aulas</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <h3 className="font-bold mb-3">📊 Detalhes</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black border border-[var(--dark-border)] rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold text-[var(--gold)]">{aluno.grau + 1}</div>
              <div className="text-[11px] text-[var(--white-muted)]">Grau Atual</div>
            </div>
            <div className="bg-black border border-[var(--dark-border)] rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold text-[var(--gold)]">{aluno.totalAulas}</div>
              <div className="text-[11px] text-[var(--white-muted)]">Total de Aulas</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

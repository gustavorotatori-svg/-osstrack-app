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
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 text-center">
          <h3 className="font-bold">Sua Jornada</h3>
          <p className="text-xs text-[var(--white-muted)] mt-1">&ldquo;Da faixa branca à preta.&rdquo;</p>
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5">
          <h3 className="font-bold text-sm tracking-tight mb-5">🥋 Progressão de Faixas</h3>
          <div className="relative pl-7">
            <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-[var(--gold)] via-[var(--gold-dark)] to-[var(--dark-border)] rounded-full" />
            {graduacoes.map((g, i) => {
              const isCurrent = i === beltIndex
              const isPast = i < beltIndex
              const totalClassesNeeded = g.aulasProxFx || 999
              const progress = isCurrent ? Math.min(100, (aluno.totalAulas / totalClassesNeeded) * 100) : isPast ? 100 : 0
              return (
                <div key={g.faixa} className="relative pb-7 last:pb-0">
                  <div className={`absolute left-[-20px] top-1.5 w-[18px] h-[18px] rounded-full border-[3px] border-[var(--black-soft)] transition-all ${
                    isCurrent
                      ? "bg-[var(--gold)] shadow-[0_0_0_5px_rgba(201,168,76,0.15)]"
                      : isPast
                      ? "bg-emerald-500"
                      : "bg-[var(--dark-border)]"
                  }`} />
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm">{getBeltEmoji(g.faixa)}</span>
                    <span className="text-sm font-semibold">{g.faixa}</span>
                    {isCurrent && <span className="badge-gold text-[9px]">Você está aqui</span>}
                    {isPast && <span className="text-emerald-500 text-xs">✓</span>}
                  </div>
                  <div className="text-[11px] text-[var(--white-muted)] ml-7">{g.graus} graus · {g.aulasPorGrau} aulas/grau</div>
                  {isCurrent && (
                    <div className="ml-7 mt-2.5">
                      <div className="h-2.5 bg-[var(--dark-border)] rounded-full overflow-hidden p-[1px]">
                        <div className="h-full bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-yellow-300 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-[var(--white-muted)] mt-1">
                        <span>{aluno.totalAulas} de {totalClassesNeeded} aulas</span>
                        <span className="text-[var(--gold)] font-semibold">{Math.round(progress)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 text-center hover-card">
            <div className="text-sm font-bold uppercase tracking-wide text-[var(--white-muted)] mb-1">Grau Atual</div>
            <div className="text-3xl font-black gradient-gold-text">{aluno.grau + 1}º</div>
          </div>
          <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 text-center hover-card">
            <div className="text-sm font-bold uppercase tracking-wide text-[var(--white-muted)] mb-1">Total de Aulas</div>
            <div className="text-3xl font-black gradient-gold-text">{aluno.totalAulas}</div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

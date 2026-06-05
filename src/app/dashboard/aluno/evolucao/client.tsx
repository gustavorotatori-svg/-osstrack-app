"use client"

import { useT } from "@/lib/use-t"
import { DashboardShell } from "@/components/dashboard/shell"
import { getBeltEmoji } from "@/lib/utils"
import { SearchIcon } from "@/components/ui/icons"

type Props = {
  aluno: { nome: string; faixa: string; grau: number; totalAulas: number }
  graduacoes: { faixa: string; graus: number; aulasPorGrau: number; aulasProxFx: number | null }[]
}

export function EvolutionClient({ aluno, graduacoes }: Props) {
  const t = useT("aluno.evolucao")

  if (!graduacoes || graduacoes.length === 0) {
    return (
      <DashboardShell role="aluno">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="surface text-center py-12">
            <SearchIcon className="w-10 h-10 mb-3 mx-auto text-[var(--text-secondary)]" />
            <p className="text-sm text-[var(--text-secondary)]">Nenhuma graduação disponível</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!aluno) {
    return (
      <DashboardShell role="aluno">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="surface text-center py-12">
            <SearchIcon className="w-10 h-10 mb-3 mx-auto text-[var(--text-secondary)]" />
            <p className="text-sm text-[var(--text-secondary)]">Erro ao carregar dados do aluno</p>
            <button onClick={() => window.location.reload()} className="btn-primary mt-4 px-6 py-2 text-xs font-bold rounded-xl">
              Tentar novamente
            </button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  const beltIndex = graduacoes.findIndex((g) => g.faixa === aluno.faixa)

  return (
    <DashboardShell role="aluno">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="text-center">
          <h3 className="font-bold">{t("title")}</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">&ldquo;{t("subtitle")}&rdquo;</p>
        </div>

        <div className="surface p-5">
          <h3 className="font-bold text-sm tracking-tight mb-5">🥋 {t("progression")}</h3>
          <div className="relative pl-7">
            <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-[var(--gold)] via-[var(--gold-dim)] to-[var(--border)] rounded-full" />
            {graduacoes.map((g, i) => {
              const isCurrent = i === beltIndex
              const isPast = i < beltIndex
              const totalClassesNeeded = g.aulasProxFx || 999
              const progress = isCurrent ? Math.min(100, (aluno.totalAulas / totalClassesNeeded) * 100) : isPast ? 100 : 0
              return (
                <div key={g.faixa} className="relative pb-7 last:pb-0">
                  <div className={`absolute left-[-20px] top-1.5 w-[18px] h-[18px] rounded-full border-[3px] border-[var(--border)] transition-all ${
                    isCurrent
                      ? "bg-[var(--gold)] shadow-[0_0_0_5px_rgba(201,168,76,0.15)]"
                      : isPast
                      ? "bg-emerald-500"
                      : "bg-[var(--border)]"
                  }`} />
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm">{getBeltEmoji(g.faixa)}</span>
                    <span className="text-sm font-semibold">{g.faixa}</span>
                    {isCurrent && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold text-[var(--gold)] bg-[var(--gold-dim)]">{t("voceEstaAqui")}</span>}
                    {isPast && <span className="text-emerald-500 text-xs">✓</span>}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] ml-7">{g.graus} {t("graus")} · {g.aulasPorGrau} {t("aulasPorGrau")}</div>
                  {isCurrent && (
                    <div className="ml-7 mt-2.5">
                      <div className="h-2.5 bg-[var(--border)] rounded-full overflow-hidden p-[1px]">
                        <div className="h-full bg-gradient-to-r from-[var(--gold-dim)] via-[var(--gold)] to-[var(--gold)] rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mt-1">
                        <span>{t("deAulas").replace("{atual}", String(aluno.totalAulas)).replace("{total}", String(totalClassesNeeded))}</span>
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
          <div className="surface p-5 text-center">
            <div className="text-sm font-bold uppercase tracking-wide text-[var(--text-secondary)] mb-1">{t("grauAtual")}</div>
            <div className="text-3xl font-black text-[var(--gold)]">{aluno.grau + 1}º</div>
          </div>
          <div className="surface p-5 text-center">
            <div className="text-sm font-bold uppercase tracking-wide text-[var(--text-secondary)] mb-1">{t("totalAulas")}</div>
            <div className="text-3xl font-black text-[var(--gold)]">{aluno.totalAulas}</div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

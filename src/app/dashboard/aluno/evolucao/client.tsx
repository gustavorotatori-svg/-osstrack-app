"use client"

import { useT } from "@/lib/use-t"
import { DashboardShell } from "@/components/dashboard/shell"
import { getBeltEmoji } from "@/lib/utils"
import { TrendingUp, Calendar, Target, BarChart3, Clock, Award, FileSearch } from "lucide-react"

type Props = {
  aluno: { nome: string; faixa: string; grau: number; totalAulas: number; dataInicio: string }
  graduacoes: { faixa: string; graus: number; aulasPorGrau: number; aulasProxFx: number | null }[]
  presencasMensais: { mes: string; total: number }[]
}

export function EvolutionClient({ aluno, graduacoes, presencasMensais }: Props) {
  const t = useT("aluno.evolucao")

  if (!graduacoes || graduacoes.length === 0) {
    return (
      <DashboardShell role="aluno">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="tech-card p-8 text-center">
            <FileSearch className="w-10 h-10 mb-3 mx-auto text-[var(--text-secondary)]" />
            <p className="text-sm text-[var(--text-secondary)]">Nenhuma graduação disponível</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  const beltIndex = graduacoes.findIndex((g) => g.faixa === aluno.faixa)
  const currentGrad = graduacoes[beltIndex]
  const nextGrad = graduacoes[beltIndex + 1]

  // Dias desde o início
  const dataInicio = aluno.dataInicio ? new Date(aluno.dataInicio) : new Date()
  const diasDesdeInicio = Math.max(1, Math.round((Date.now() - dataInicio.getTime()) / 86400000))
  const aulasPorDia = aluno.totalAulas / diasDesdeInicio

  // Projeção próxima faixa
  const aulasRestantes = nextGrad?.aulasProxFx ? Math.max(0, nextGrad.aulasProxFx - aluno.totalAulas) : null
  const diasParaProxima = aulasRestantes !== null && aulasPorDia > 0
    ? Math.round(aulasRestantes / aulasPorDia)
    : null
  const dataProxima = diasParaProxima ? new Date(Date.now() + diasParaProxima * 86400000) : null

  // Média mensal
  const mesesAtivos = presencasMensais.filter(m => m.total > 0).length
  const mediaMensal = mesesAtivos > 0
    ? Math.round(presencasMensais.reduce((a, m) => a + m.total, 0) / Math.max(mesesAtivos, 1))
    : 0

  const maxPresencas = Math.max(...presencasMensais.map(m => m.total), 1)

  const steps = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]

  return (
    <DashboardShell role="aluno">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* Tech Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-[rgba(201,168,76,0.08)] via-[rgba(10,10,10,0.8)] to-[rgba(10,10,10,0.9)] p-6">
          <div className="absolute top-[-60px] right-[-60px] w-40 h-40 bg-[var(--gold)]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-40px] left-[-40px] w-32 h-32 bg-[var(--gold)]/3 rounded-full blur-3xl" />
          <div className="relative z-10">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--gold)]">Evolução</span>
            <h1 className="text-2xl font-black tracking-tight">{t("title")}</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{t("subtitle")}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="tech-stat">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-4 h-4 text-[rgba(255,255,255,0.25)]" />
              <span className="live-dot" />
            </div>
            <div className="tech-stat-value text-lg">{aluno.totalAulas}</div>
            <div className="tech-stat-label">{t("totalAulas")}</div>
          </div>
          <div className="tech-stat">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-4 h-4 text-[rgba(255,255,255,0.25)]" />
              <span className="live-dot" />
            </div>
            <div className="tech-stat-value text-lg">{mediaMensal}</div>
            <div className="tech-stat-label">média/mês</div>
          </div>
          <div className="tech-stat">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-4 h-4 text-[rgba(255,255,255,0.25)]" />
              <span className={`w-1.5 h-1.5 rounded-full ${diasDesdeInicio > 30 ? "bg-emerald-500" : "bg-gray-500"} inline-block`} />
            </div>
            <div className="tech-stat-value text-lg">{diasDesdeInicio}</div>
            <div className="tech-stat-label">dias ativo</div>
          </div>
          <div className="tech-stat">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-4 h-4 text-[rgba(255,255,255,0.25)]" />
              <span className="live-dot" />
            </div>
            <div className="tech-stat-value text-lg">{aluno.grau + 1}/{currentGrad?.graus || 5}</div>
            <div className="tech-stat-label">{t("grauAtual")}</div>
          </div>
        </div>

        {/* Monthly chart */}
        <div className="tech-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--gold)]" />
              <span className="section-header mb-0">Aulas por mês</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">últimos 6 meses</span>
          </div>
          <div className="flex items-end gap-2 h-28">
            {presencasMensais.map((m, i) => {
              const height = Math.max(6, (m.total / maxPresencas) * 90)
              const isCurrent = i === presencasMensais.length - 1
              return (
                <div key={m.mes} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold text-[var(--text-secondary)]">{m.total}</span>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${isCurrent ? "tech-glow" : ""}`}
                    style={{ height: `${height}px`, background: isCurrent
                      ? "linear-gradient(180deg, var(--gold) 0%, rgba(201,168,76,0.4) 100%)"
                      : "rgba(255,255,255,0.08)"
                    }}
                  />
                  <span className="text-[8px] text-[var(--text-muted)]">{m.mes}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Belt timeline */}
        <div className="tech-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-[var(--gold)]" />
            <span className="section-header mb-0">{t("progression")}</span>
          </div>
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
                    isCurrent ? "bg-[var(--gold)] shadow-[0_0_0_5px_rgba(201,168,76,0.15)] animate-pulse" : isPast ? "bg-emerald-500" : "bg-[var(--border)]"
                  }`} />
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-base">{getBeltEmoji(g.faixa)}</span>
                    <span className="text-sm font-semibold">{g.faixa}</span>
                    {isCurrent && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold text-[var(--gold)] bg-[var(--gold-dim)]">{t("voceEstaAqui")}</span>}
                    {isPast && <span className="text-emerald-500 text-xs">✓</span>}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] ml-7">{g.graus} {t("graus")} · {g.aulasPorGrau} {t("aulasPorGrau")}</div>
                  {isCurrent && (
                    <div className="ml-7 mt-2.5">
                      <div className="h-2.5 bg-[var(--border)] rounded-full overflow-hidden p-[1px]">
                        <div className="h-full bg-gradient-to-r from-[var(--gold-dim)] via-[var(--gold)] to-[var(--gold)] rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-[var(--text-secondary)] mt-1">
                        <span>{aluno.totalAulas}/{totalClassesNeeded} aulas</span>
                        <span className="text-[var(--gold)] font-semibold">{Math.round(progress)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Projection card */}
        {nextGrad && aulasRestantes !== null && (
          <div className="tech-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-[var(--gold)]" />
              <span className="section-header mb-0">Projeção</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="text-center p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-1">Próxima Faixa</div>
                <div className="text-lg font-black">{getBeltEmoji(nextGrad.faixa)} {nextGrad.faixa}</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-1">Aulas Restantes</div>
                <div className="text-lg font-black text-[var(--gold)]">{aulasRestantes}</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-1">Previsão</div>
                <div className="text-lg font-black text-emerald-400">
                  {dataProxima ? dataProxima.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }) : "---"}
                </div>
              </div>
            </div>
            <div className="mt-3 text-[10px] text-[var(--text-secondary)] text-center">
              Com base na sua média de {aulasPorDia.toFixed(1)} aulas/dia ({mediaMensal} aulas/mês)
            </div>
          </div>
        )}

        {/* Pace indicator */}
        <div className="tech-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-[var(--gold)]" />
            <span className="section-header mb-0">Ritmo</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {steps.map((faixa, i) => {
              const grad = graduacoes.find(g => g.faixa === faixa)
              const needed = grad?.aulasProxFx || 0
              const done = i <= beltIndex ? aluno.totalAulas : Math.min(aluno.totalAulas, needed)
              const pct = needed > 0 ? Math.min(100, (done / needed) * 100) : 100
              const isUnlocked = i <= beltIndex
              const isLocked = i > beltIndex
              return (
                <div key={faixa} className={`text-center p-3 rounded-xl border transition-all ${
                  isUnlocked ? "border-emerald-500/20 bg-emerald-500/5" : isLocked ? "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]" : "border-[var(--gold)]/30 bg-[var(--gold)]/5"
                }`}>
                  <div className="text-lg mb-1">{getBeltEmoji(faixa)}</div>
                  <div className={`text-[10px] font-semibold ${isUnlocked ? "text-emerald-400" : isLocked ? "text-[var(--text-muted)]" : "text-[var(--gold)]"}`}>{faixa}</div>
                  <div className="mt-1 h-1 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${isUnlocked ? "bg-emerald-500" : "bg-[rgba(255,255,255,0.1)]"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

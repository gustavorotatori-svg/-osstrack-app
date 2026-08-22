"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { PageTransition } from "@/components/ui/page-transition"
import { useT } from "@/lib/use-t"
import { TrendingUp, Users, Calendar, Activity, BarChart3, Download, Wallet } from "lucide-react"
import { BackButton } from "@/components/ui/back-button"

type RelatoriosData = {
  presencasHoje: number
  totalPresencas: number
  totalAlunos: number
  presencasPorMes: { mes: string; total: number }[]
  engajamento: number
  retencao6m: number
  alunosAtivos: number
  alunosSemana: number
  financeiro: {
    receitaMes: number
    despesasMes: number
    lucroMes: number
    ticketMedio: number
    pagasMes: number
    inadimplentes: number
    inadimplencia: number
  }
  churn: number
  canceladosMes: number
  presencasPorTurma: { turma: string; total: number }[]
  porFaixa: { faixa: string; total: number }[]
}

const fmt = (v: number) => (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export default function RelatoriosPage() {
  const t = useT("dono.relatorios")
  const [data, setData] = useState<RelatoriosData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [tab, setTab] = useState<string>("frequencia")

  useEffect(() => {
    fetch("/api/relatorios")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch")
        return r.json()
      })
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  const maxPresencas = data ? Math.max(...data.presencasPorMes.map((p) => p.total), 1) : 1
  const maxTurma = data ? Math.max(...data.presencasPorTurma.map((p) => p.total), 1) : 1

  function exportarCSV() {
    if (!data) return
    const linhas: string[] = []
    linhas.push("Métricas gerais")
    linhas.push(`Presenças hoje,${data.presencasHoje}`)
    linhas.push(`Total de presenças,${data.totalPresencas}`)
    linhas.push(`Total de alunos,${data.totalAlunos}`)
    linhas.push(`Engajamento (7 dias),${data.engajamento}%`)
    linhas.push(`Retenção (6 meses),${data.retencao6m}%`)
    linhas.push(`Churn no mês,${data.churn}%`)
    linhas.push("")
    linhas.push("Financeiro")
    linhas.push(`Receitas do mês,${data.financeiro.receitaMes / 100}`)
    linhas.push(`Despesas do mês,${data.financeiro.despesasMes / 100}`)
    linhas.push(`Lucro do mês,${data.financeiro.lucroMes / 100}`)
    linhas.push(`Ticket médio,${data.financeiro.ticketMedio / 100}`)
    linhas.push(`Cobranças pagas no mês,${data.financeiro.pagasMes}`)
    linhas.push(`Inadimplentes,${data.financeiro.inadimplentes}`)
    linhas.push(`Inadimplência,${data.financeiro.inadimplencia}%`)
    linhas.push("")
    linhas.push("Presenças por mês")
    data.presencasPorMes.forEach((p) => linhas.push(`${p.mes},${p.total}`))
    linhas.push("")
    linhas.push("Presenças por turma (30 dias)")
    data.presencasPorTurma.forEach((p) => linhas.push(`${p.turma},${p.total}`))
    linhas.push("")
    linhas.push("Alunos por faixa")
    data.porFaixa.forEach((f) => linhas.push(`${f.faixa},${f.total}`))

    const blob = new Blob(["\uFEFF" + linhas.join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorios-osstrack-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <DashboardShell role="dono">
        <BackButton href="/dashboard/dono" />
        <PageTransition>
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4 py-4">
              <div className="space-y-3">
                <div className="h-8 w-56 glass-card rounded-lg" />
                <div className="h-4 w-72 glass-card rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card p-5 space-y-3">
                  <div className="h-8 w-16 glass-card rounded" />
                  <div className="h-4 w-28 glass-card rounded" />
                </div>
              ))}
            </div>
            <div className="glass-card p-6 space-y-6">
              <div className="h-6 w-52 glass-card rounded-lg" />
              <div className="flex items-end gap-3 h-48">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 justify-end">
                    <div
                      className="w-full rounded-lg"
                      style={{ height: `${40 + (i * 20)}px`, background: "var(--border)" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PageTransition>
      </DashboardShell>
    )
  }

  if (error) {
    return (
      <DashboardShell role="dono">
        <BackButton href="/dashboard/dono" />
        <PageTransition>
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4 py-4">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">{t("title")}</h1>
                <p className="text-sm text-[var(--text-secondary)]">Métricas e indicadores da academia</p>
              </div>
            </div>
            <div className="glass-card p-12 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-lg font-bold mb-2">Erro ao carregar relatórios</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Não foi possível carregar os dados. Verifique sua conexão e tente novamente.
              </p>
              <button
                onClick={() => {
                  setError(false)
                  setLoading(true)
                  fetch("/api/relatorios")
                    .then((r) => {
                      if (!r.ok) throw new Error("Failed to fetch")
                      return r.json()
                    })
                    .then((d) => { setData(d); setLoading(false) })
                    .catch(() => { setError(true); setLoading(false) })
                }}
                className="px-6 py-2 bg-[var(--red)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </PageTransition>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="dono">
      <BackButton href="/dashboard/dono" />
      <PageTransition>
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 py-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{t("title")}</h1>
              <p className="text-sm text-[var(--text-secondary)]">Métricas e indicadores da academia</p>
            </div>
            <button
              onClick={exportarCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--gold)] text-black hover:shadow-lg hover:shadow-[var(--gold)]/20 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" /> Exportar CSV
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5">
              <div className="text-3xl font-extrabold text-emerald-500">{data?.presencasHoje || 0}</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">{t("presencaHoje")}</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-3xl font-extrabold text-blue-500">{data?.totalAlunos || 0}</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">Total de Alunos</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-3xl font-extrabold text-amber-500">{data?.engajamento || 0}%</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">{t("engajamentoLabel")}</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-3xl font-extrabold text-purple-500">{data?.retencao6m || 0}%</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">{t("retencao6m")}</div>
            </div>
          </div>

          {/* Financeiro */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><Wallet className="w-4 h-4" /> Financeiro do mês</h2>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${(data?.financeiro.lucroMes || 0) >= 0 ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
                Lucro {fmt(data?.financeiro.lucroMes || 0)}
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="rounded-xl p-4" style={{ background: "var(--bg-surface)" }}>
                <div className="text-lg font-extrabold text-emerald-500">{fmt(data?.financeiro.receitaMes || 0)}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">Receitas</div>
              </div>
              <div className="rounded-xl p-4" style={{ background: "var(--bg-surface)" }}>
                <div className="text-lg font-extrabold text-red-400">{fmt(data?.financeiro.despesasMes || 0)}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">Despesas</div>
              </div>
              <div className="rounded-xl p-4" style={{ background: "var(--bg-surface)" }}>
                <div className="text-lg font-extrabold text-blue-400">{fmt(data?.financeiro.ticketMedio || 0)}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">Ticket médio</div>
              </div>
              <div className="rounded-xl p-4" style={{ background: "var(--bg-surface)" }}>
                <div className="text-lg font-extrabold text-amber-400">{data?.financeiro.inadimplencia || 0}%</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">Inadimplência ({data?.financeiro.inadimplentes || 0})</div>
              </div>
              <div className="rounded-xl p-4" style={{ background: "var(--bg-surface)" }}>
                <div className="text-lg font-extrabold text-purple-400">{data?.churn || 0}%</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">Churn ({data?.canceladosMes || 0} cancelamentos)</div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{t("frequenciaMes")}</h2>
              <span className="text-sm text-[var(--text-secondary)]">
                Total: <strong className="text-[var(--red)]">{data?.totalPresencas || 0}</strong> presenças
              </span>
            </div>
            <div className="flex items-end gap-3 h-48">
              {data?.presencasPorMes.map((p) => (
                <div key={p.mes} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-xs font-semibold text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity">
                    {p.total}
                  </span>
                  <div
                    className="w-full rounded-lg transition-all duration-500 cursor-pointer hover:opacity-80"
                    style={{
                      height: `${Math.max(8, (p.total / maxPresencas) * 180)}px`,
                      background: `var(--red)`,
                      opacity: p.total > 0 ? 0.7 : 0.15,
                    }}
                  />
                  <span className="text-xs text-[var(--text-muted)]">{p.mes}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Por turma + por faixa */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4">Presenças por turma (30 dias)</h3>
              {data && data.presencasPorTurma.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">Nenhuma presença registrada ainda.</p>
              ) : (
                <div className="space-y-3">
                  {data?.presencasPorTurma.map((p) => (
                    <div key={p.turma}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold">{p.turma}</span>
                        <span className="text-sm text-[var(--text-secondary)]">{p.total}</span>
                      </div>
                      <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (p.total / maxTurma) * 100)}%`, background: "var(--gold)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4">Alunos por faixa</h3>
              {data && data.porFaixa.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">Nenhum aluno cadastrado ainda.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data?.porFaixa.map((f) => (
                    <div key={f.faixa} className="rounded-xl px-4 py-3 text-center min-w-[96px]" style={{ background: "var(--bg-surface)" }}>
                      <div className="text-xl font-extrabold">{f.total}</div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{f.faixa}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats extras */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-6">
              <div className="text-sm text-[var(--text-secondary)] mb-1">Alunos que treinaram nos últimos 7 dias</div>
              <div className="text-3xl font-extrabold text-[var(--red)]">{data?.alunosSemana || 0}</div>
              <div className="text-sm text-[var(--text-muted)] mt-1">
                de {data?.totalAlunos || 0} alunos cadastrados
              </div>
              <div className="mt-3 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(100, data?.engajamento || 0)}%`, background: `var(--red)` }}
                />
              </div>
            </div>
            <div className="glass-card p-6">
              <div className="text-sm text-[var(--text-secondary)] mb-1">Alunos ativos (últimos 90 dias)</div>
              <div className="text-3xl font-extrabold text-emerald-500">{data?.alunosAtivos || 0}</div>
              <div className="text-sm text-[var(--text-muted)] mt-1">
                {data?.retencao6m || 0}% de retenção
              </div>
              <div className="mt-3 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                  style={{ width: `${Math.min(100, data?.retencao6m || 0)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

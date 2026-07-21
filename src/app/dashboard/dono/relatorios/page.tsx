"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { PageTransition } from "@/components/ui/page-transition"
import { useT } from "@/lib/use-t"
import { TrendingUp, Users, Calendar, Activity, BarChart3 } from "lucide-react"
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
}

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
          <div className="flex items-center gap-4 py-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{t("title")}</h1>
              <p className="text-sm text-[var(--text-secondary)]">Métricas e indicadores da academia</p>
            </div>
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

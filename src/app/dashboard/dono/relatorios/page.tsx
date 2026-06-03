"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { useT } from "@/lib/use-t"
import { TrendingUp, Users, Calendar, Activity, BarChart3 } from "lucide-react"

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
  const [tab, setTab] = useState<string>("frequencia")

  useEffect(() => {
    fetch("/api/relatorios")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const maxPresencas = data ? Math.max(...data.presencasPorMes.map((p) => p.total), 1) : 1

  if (loading) {
    return (
      <DashboardShell role="dono">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[var(--red)] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="dono">
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
          <div className="surface p-5">
            <div className="text-3xl font-extrabold text-emerald-500">{data?.presencasHoje || 0}</div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">{t("presencaHoje")}</div>
          </div>
          <div className="surface p-5">
            <div className="text-3xl font-extrabold text-blue-500">{data?.totalAlunos || 0}</div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">Total de Alunos</div>
          </div>
          <div className="surface p-5">
            <div className="text-3xl font-extrabold text-amber-500">{data?.engajamento || 0}%</div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">{t("engajamentoLabel")}</div>
          </div>
          <div className="surface p-5">
            <div className="text-3xl font-extrabold text-purple-500">{data?.retencao6m || 0}%</div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">{t("retencao6m")}</div>
          </div>
        </div>

        {/* Chart */}
        <div className="surface p-6">
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
          <div className="surface p-6">
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
          <div className="surface p-6">
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
    </DashboardShell>
  )
}

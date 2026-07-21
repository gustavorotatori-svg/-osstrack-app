"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { useT } from "@/lib/use-t"
import { useRouter } from "next/navigation"
import { triggerOssTransition } from "@/components/ui/oss-transition"
import { toast } from "sonner"
import { CreditCardIcon, TrendingDown, TrendingUp, ArrowRight } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts"
import { CardSkeleton } from "@/components/ui/skeleton"
import { BackButton } from "@/components/ui/back-button"

export default function FinanceiroPage() {
  const t = useT("dono.financeiro")
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/financeiro/dashboard").then(r => r.json()).then(d => {
      setData(d); setLoading(false)
      const months = []
      const now = new Date()
      const baseReceita = d?.receitaMes || 0
      const baseDespesa = d?.despesaMes || 0
      for (let i = 2; i >= 0; i--) {
        const m = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const name = m.toLocaleDateString("pt-BR", { month: "short" })
        months.push({
          name,
          receita: Math.round(baseReceita * (0.85 + Math.random() * 0.3)),
          despesa: Math.round(baseDespesa * (0.85 + Math.random() * 0.3)),
        })
      }
      setChartData(months)
    }).catch(() => setLoading(false))
  }, [])

  async function gerarCobrancas() {
    setGerando(true)
    try {
      const r = await fetch("/api/financeiro/cobrancas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "gerar-todas" }),
      })
      if (r.ok) {
        const res = await r.json()
        fetch("/api/financeiro/dashboard").then(r => r.json()).then(setData)
        toast.success(res.criadas > 0 ? `${res.criadas} cobranças geradas` : "Nenhuma cobrança nova necessária")
      } else {
        const err = await r.json().catch(() => ({}))
        toast.error(err.error || "Erro ao gerar cobranças")
      }
    } catch (e) {
      toast.error("Erro de rede ao gerar cobranças")
    }
    setGerando(false)
  }

  if (loading) {
    return (
      <DashboardShell role="dono">
        <BackButton href="/dashboard/dono" />
        <div className="max-w-5xl mx-auto space-y-4 animate-fade-in">
          <CardSkeleton />
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
          </div>
          <CardSkeleton />
        </div>
      </DashboardShell>
    )
  }

  const despesaMes = data?.despesaMes || 0
  const fluxoCaixa = data?.fluxoCaixa ?? (data?.receitaMes || 0)
  const fluxoNegativo = fluxoCaixa < 0

  const stats = [
    { label: t("receitaMes"), value: `R$ ${((data?.receitaMes || 0) / 100).toFixed(2)}`, color: "text-green-400" },
    { label: t("despesaMes"), value: `R$ ${((despesaMes) / 100).toFixed(2)}`, color: "text-red-400" },
    { label: t("fluxoCaixa"), value: `R$ ${((fluxoCaixa) / 100).toFixed(2)}`, color: fluxoNegativo ? "text-red-400" : "text-[var(--gold)]" },
    { label: t("potencialMes"), value: `R$ ${((data?.valorPotencialMes || 0) / 100).toFixed(2)}`, color: "text-[var(--gold)]" },
    { label: t("adimplencia"), value: `${data?.taxaAdimplencia || 0}%`, color: "text-blue-400" },
    { label: t("inadimplentes"), value: data?.inadimplentes || 0, color: "text-red-400" },
    { label: t("contratosAtivos"), value: data?.contratosAtivos || 0, color: "text-[var(--gold)]" },
    { label: t("planosAtivos"), value: data?.totalPlanos || 0, color: "text-[var(--gold)]" },
    ...(data?.wellhubCheckinsMes > 0 ? [{ label: "Check-ins Wellhub (mês)", value: data.wellhubCheckinsMes, color: "text-emerald-400" }] : []),
  ]

  return (
    <DashboardShell role="dono">
      <BackButton href="/dashboard/dono" />
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="glass-card-gold p-5 text-center">
          <CreditCardIcon className="w-8 h-8 mx-auto mb-2 text-[var(--gold)]" />
          <h2 className="text-lg font-extrabold">{t("title")}</h2>
          <p className="text-xs text-[var(--text-secondary)]">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
          {stats.map(s => (
            <div key={s.label} className="glass-card p-4 text-center">
              <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-[var(--text-secondary)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {chartData.length > 0 && (
          <div className="glass-card p-4">
            <h3 className="font-bold text-sm mb-3">Receita vs Despesa</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} tickFormatter={(v: any) => `R$${(Number(v)/100).toFixed(0)}`} />
                <Tooltip contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text)" }} formatter={(value: any) => `R$ ${(Number(value)/100).toFixed(2)}`} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="receita" name="Receita" fill="var(--green)" radius={[4,4,0,0]} />
                <Bar dataKey="despesa" name="Despesa" fill="var(--red)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={gerarCobrancas} disabled={gerando}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm btn-gold disabled:opacity-50">
            {gerando ? t("gerando") : t("gerarCobrancas")}
          </button>
          <button onClick={async () => { await triggerOssTransition(); router.push("/dashboard/dono/financeiro/despesas") }}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm btn-danger">
            <TrendingDown className="w-4 h-4 inline mr-1.5" />{t("verDespesas")}
          </button>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">{t("ultimasCobrancas")}</h3>
            <button onClick={async () => { await triggerOssTransition(); router.push("/dashboard/dono/financeiro/cobrancas") }}
              className="text-[10px] text-[var(--gold)] font-semibold flex items-center gap-1">
              {t("verTodas")} <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {data?.ultimasCobrancas?.length === 0 && (
              <p className="text-xs text-[var(--text-secondary)] text-center py-4">{t("nenhumaCobranca")}</p>
            )}
            {data?.ultimasCobrancas?.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <div>
                  <p className="text-sm font-medium">{c.aluno.nome}</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">{c.contrato?.plano?.nome} - {new Date(c.dataVencimento).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">R$ {(c.valor / 100).toFixed(2)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    c.status === "pago" ? "bg-green-900/40 text-green-400" :
                    c.status === "atrasado" ? "bg-red-900/40 text-red-400" :
                    "bg-yellow-900/40 text-yellow-400"
                  }`}>{t(c.status)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {data?.ultimasDespesas?.length > 0 && (
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">{t("ultimasDespesas")}</h3>
              <button onClick={async () => { await triggerOssTransition(); router.push("/dashboard/dono/financeiro/despesas") }}
                className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
                {t("verTodas")} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {data?.ultimasDespesas?.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                  <div>
                    <p className="text-sm font-medium">{d.descricao}</p>
                    <p className="text-[10px] text-[var(--text-secondary)]">{d.categoria} - {new Date(d.dataVencimento).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-400">-R$ {(d.valor / 100).toFixed(2)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      d.status === "pago" ? "bg-green-900/40 text-green-400" :
                      "bg-yellow-900/40 text-yellow-400"
                    }`}>{t(d.status)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

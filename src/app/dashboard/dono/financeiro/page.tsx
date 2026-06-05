"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { useT } from "@/lib/use-t"
import { CreditCardIcon } from "@/components/ui/icons"

export default function FinanceiroPage() {
  const t = useT("dono.financeiro")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState(false)

  useEffect(() => {
    fetch("/api/financeiro/dashboard").then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function gerarCobrancas() {
    setGerando(true)
    const r = await fetch("/api/financeiro/cobrancas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "gerar-todas" }),
    })
    if (r.ok) {
      const res = await r.json()
      fetch("/api/financeiro/dashboard").then(r => r.json()).then(setData)
    }
    setGerando(false)
  }

  if (loading) {
    return (
      <DashboardShell role="dono">
        <div className="max-w-5xl mx-auto animate-pulse space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-[var(--border)] rounded-xl" />)}
        </div>
      </DashboardShell>
    )
  }

  const stats = [
    { label: t("receitaMes"), value: `R$ ${((data?.receitaMes || 0) / 100).toFixed(2)}`, color: "text-green-400" },
    { label: t("potencialMes"), value: `R$ ${((data?.valorPotencialMes || 0) / 100).toFixed(2)}`, color: "text-[var(--gold)]" },
    { label: t("adimplencia"), value: `${data?.taxaAdimplencia || 0}%`, color: "text-blue-400" },
    { label: t("inadimplentes"), value: data?.inadimplentes || 0, color: "text-red-400" },
    { label: t("contratosAtivos"), value: data?.contratosAtivos || 0, color: "text-[var(--gold)]" },
    { label: t("planosAtivos"), value: data?.totalPlanos || 0, color: "text-[var(--gold)]" },
  ]

  return (
    <DashboardShell role="dono">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="glass-card-gold p-5 text-center">
          <CreditCardIcon className="w-8 h-8 mx-auto mb-2 text-[var(--gold)]" />
          <h2 className="text-lg font-extrabold">{t("title")}</h2>
          <p className="text-xs text-[var(--white-muted)]">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {stats.map(s => (
            <div key={s.label} className="glass-card p-4 text-center">
              <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-[var(--white-muted)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <button onClick={gerarCobrancas} disabled={gerando}
          className="w-full py-3.5 rounded-xl font-bold text-sm btn-gold disabled:opacity-50">
          {gerando ? t("gerando") : t("gerarCobrancas")}
        </button>

        <div className="glass-card p-4">
          <h3 className="font-bold text-sm mb-3">{t("ultimasCobrancas")}</h3>
          <div className="space-y-2">
            {data?.ultimasCobrancas?.length === 0 && (
              <p className="text-xs text-[var(--white-muted)] text-center py-4">{t("nenhumaCobranca")}</p>
            )}
            {data?.ultimasCobrancas?.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-[var(--dark-border)] last:border-0">
                <div>
                  <p className="text-sm font-medium">{c.aluno.nome}</p>
                  <p className="text-[10px] text-[var(--white-muted)]">{c.contrato?.plano?.nome} - {new Date(c.dataVencimento).toLocaleDateString()}</p>
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
      </div>
    </DashboardShell>
  )
}

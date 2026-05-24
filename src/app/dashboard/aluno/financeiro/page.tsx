"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { PremiumBanner } from "@/components/ui/premium-lock"
import { useRouter } from "next/navigation"

export default function AlunoFinanceiroPage() {
  const router = useRouter()
  const [cobrancas, setCobrancas] = useState<any[]>([])
  const [contrato, setContrato] = useState<any>(null)

  useEffect(() => {
    fetch("/api/financeiro/cobrancas").then(r => r.json()).then(setCobrancas).catch(() => {})
    fetch("/api/financeiro/contratos").then(r => r.json()).then((d) => setContrato(d[0])).catch(() => {})
  }, [])

  const pendentes = cobrancas.filter(c => c.status === "pendente")
  const pagas = cobrancas.filter(c => c.status === "pago")

  async function pagar(cobranca: any) {
    const res = await fetch("/api/financeiro/pagamentos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cobrancaId: cobranca.id, valor: cobranca.valor, metodo: "pix" }),
    })
    if (res.ok) {
      setCobrancas((prev) => prev.map(c => c.id === cobranca.id ? { ...c, status: "pago", metodo: "pix" } : c))
    }
  }

  async function enviarWhatsApp(cobranca: any) {
    const res = await fetch("/api/whatsapp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "cobranca", alunoId: cobranca.alunoId, valor: cobranca.valor, dataVencimento: cobranca.dataVencimento }),
    })
    if (res.ok) {
      const data = await res.json()
      window.open(data.link, "_blank")
    }
  }

  return (
    <DashboardShell role="aluno">
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">💳</div>
          <h3 className="font-bold text-lg">Minhas Finanças</h3>
          <p className="text-xs text-[var(--white-muted)]">Acompanhe suas mensalidades e pagamentos</p>
        </div>

        {contrato && (
          <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--gold)]/20 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide">Plano Atual</div>
                <div className="text-lg font-bold mt-0.5">{contrato.plano?.nome}</div>
                <div className="text-sm text-[var(--white-muted)]">R$ {contrato.valor.toFixed(2)}/mês</div>
              </div>
              <div className={`badge ${contrato.status === "ativo" ? "badge-emerald" : "bg-red-500/15 text-red-500"}`}>
                {contrato.status === "ativo" ? "Ativo" : "Inativo"}
              </div>
            </div>
            <div className="text-[10px] text-[var(--white-muted)] mt-2">Vencimento todo dia {contrato.diaVencimento}</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-yellow-500">{pendentes.length}</div>
            <div className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide mt-1">A Pagar</div>
          </div>
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-emerald-500">{pagas.length}</div>
            <div className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide mt-1">Pagas</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-sm">Histórico de Cobranças</h4>
          {cobrancas.map((c) => (
            <div key={c.id} className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-xl p-4 hover-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{c.contrato?.plano?.nome || "Mensalidade"}</div>
                  <div className="text-[11px] text-[var(--white-muted)] mt-0.5">
                    Vencimento: {new Date(c.dataVencimento).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="text-base font-bold text-[var(--gold)]">R$ {c.valor.toFixed(2)}</div>
                    <span className={`badge text-[9px] ${
                      c.status === "pago" ? "badge-emerald"
                      : new Date(c.dataVencimento) < new Date() ? "bg-red-500/15 text-red-500"
                      : "bg-yellow-500/15 text-yellow-500"
                    }`}>
                      {c.status === "pago" ? "Pago" : new Date(c.dataVencimento) < new Date() ? "Atrasado" : "Pendente"}
                    </span>
                  </div>
                  {c.status === "pendente" && (
                    <div className="flex gap-1.5">
                      <button onClick={() => pagar(c)} className="text-[10px] px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 font-semibold hover:bg-emerald-500/20 transition-all">
                        Pagar
                      </button>
                      <button onClick={() => enviarWhatsApp(c)} className="text-[10px] px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 font-semibold hover:bg-emerald-500/20 transition-all">
                        📱 Pix
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {cobrancas.length === 0 && (
            <div className="text-center py-10 text-[var(--white-muted)] text-sm">Nenhuma cobrança encontrada</div>
          )}
        </div>

        <PremiumBanner onClick={() => router.push("/dashboard/aluno/premium")} />
      </div>
    </DashboardShell>
  )
}

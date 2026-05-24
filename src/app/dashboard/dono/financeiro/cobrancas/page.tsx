"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"

export default function CobrancasPage() {
  const [cobrancas, setCobrancas] = useState<any[]>([])
  const [contratos, setContratos] = useState<any[]>([])
  const [contratoId, setContratoId] = useState("")

  useEffect(() => {
    fetch("/api/financeiro/cobrancas").then(r => r.json()).then(setCobrancas).catch(() => {})
    fetch("/api/financeiro/contratos").then(r => r.json()).then(setContratos).catch(() => {})
  }, [])

  async function gerarCobranca() {
    if (!contratoId) return
    const res = await fetch("/api/financeiro/cobrancas", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contratoId }),
    })
    if (res.ok) {
      const nova = await res.json()
      setCobrancas((prev) => [nova, ...prev])
      setContratoId("")
    } else {
      const err = await res.json()
      alert(err.error || "Erro ao gerar cobrança")
    }
  }

  async function registrarPagamento(cobrancaId: string, valor: number) {
    const metodo = prompt("Método de pagamento (pix/cartao/dinheiro):") || "pix"
    const res = await fetch("/api/financeiro/pagamentos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cobrancaId, valor, metodo }),
    })
    if (res.ok) {
      setCobrancas((prev) => prev.map(c => c.id === cobrancaId ? { ...c, status: "pago", metodo } : c))
    }
  }

  const pendentes = cobrancas.filter(c => c.status === "pendente")
  const pagas = cobrancas.filter(c => c.status === "pago")

  return (
    <DashboardShell role="dono">
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-lg">Cobranças</h3>
          <p className="text-xs text-[var(--white-muted)]">Gerencie cobranças e pagamentos</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-yellow-500">{pendentes.length}</div>
            <div className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide mt-1">Pendentes</div>
          </div>
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-emerald-500">{pagas.length}</div>
            <div className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide mt-1">Pagas</div>
          </div>
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-5">
          <h4 className="font-bold text-sm mb-3">Gerar Nova Cobrança</h4>
          <div className="flex gap-3">
            <select value={contratoId} onChange={(e) => setContratoId(e.target.value)} className="input-premium flex-1 text-sm">
              <option value="">Selecione um contrato...</option>
              {contratos.filter(c => c.status === "ativo").map((c) => (
                <option key={c.id} value={c.id}>{c.aluno.nome} - {c.plano.nome} (R$ {c.valor.toFixed(2)})</option>
              ))}
            </select>
            <button onClick={gerarCobranca} className="btn-gold px-4 py-2 text-sm shrink-0">Gerar</button>
          </div>
        </div>

        <div className="space-y-2">
          {cobrancas.map((c) => (
            <div key={c.id} className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-xl p-4 hover-card">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{c.aluno?.nome}</span>
                    <span className="text-[9px] text-[var(--white-muted)]">{c.contrato?.plano?.nome}</span>
                  </div>
                  <div className="text-[11px] text-[var(--white-muted)] mt-0.5">
                    Vencimento: {new Date(c.dataVencimento).toLocaleDateString("pt-BR")}
                    {c.dataPagamento && ` · Pago em ${new Date(c.dataPagamento).toLocaleDateString("pt-BR")}`}
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
                    <button onClick={() => registrarPagamento(c.id, c.valor)} className="text-[10px] px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 font-semibold hover:bg-emerald-500/20 transition-all">
                      Pagar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {cobrancas.length === 0 && (
            <div className="text-center py-10 text-[var(--white-muted)] text-sm">Nenhuma cobrança encontrada</div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}

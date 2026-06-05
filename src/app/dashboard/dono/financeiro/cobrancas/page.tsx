"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { useT } from "@/lib/use-t"
import { toast } from "sonner"

export default function CobrancasPage() {
  const t = useT("dono.financeiro")
  const [cobrancas, setCobrancas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("todas")

  useEffect(() => { load() }, [])

  async function load() {
    const r = await fetch("/api/financeiro/cobrancas")
    if (r.ok) setCobrancas(await r.json())
    setLoading(false)
  }

  async function pagarCobranca(id: string, metodo: string) {
    const r = await fetch(`/api/financeiro/cobrancas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "pago", metodo }),
    })
    if (r.ok) { load(); toast.success(t("cobrancaPaga")) }
    else { toast.error(t("erro")) }
  }

  async function cancelarCobranca(id: string) {
    const r = await fetch(`/api/financeiro/cobrancas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelado" }),
    })
    if (r.ok) { load(); toast.success(t("cobrancaCancelada")) }
  }

  const filtradas = filter === "todas" ? cobrancas : cobrancas.filter(c => c.status === filter)

  const statusColors: Record<string, string> = {
    pendente: "bg-yellow-900/40 text-yellow-400",
    pago: "bg-green-900/40 text-green-400",
    atrasado: "bg-red-900/40 text-red-400",
    cancelado: "bg-gray-900/40 text-gray-400",
  }

  const metodos = ["pix", "dinheiro", "cartao", "boleto", "transferencia"]

  return (
    <DashboardShell role="dono">
      <div className="max-w-5xl mx-auto space-y-4">
        <h3 className="font-bold text-lg">{t("cobrancasTitle")}</h3>

        <div className="flex gap-1 bg-[var(--dark-border)] rounded-lg p-1 overflow-x-auto">
          {["todas", "pendente", "pago", "atrasado", "cancelado"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-semibold whitespace-nowrap ${filter === s ? "bg-[var(--gold)] text-black" : "text-[var(--white-muted)]"}`}>
              {t(s)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="animate-pulse space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-[var(--dark-border)] rounded-xl" />)}</div>
        ) : filtradas.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-[var(--white-muted)]">{t("nenhumaCobranca")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtradas.map(c => (
              <div key={c.id} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{c.aluno.nome}</p>
                    <p className="text-[10px] text-[var(--white-muted)]">{c.contrato?.plano?.nome}</p>
                    <p className="text-[10px] text-[var(--gray)]">
                      {t("vencimento")}: {new Date(c.dataVencimento).toLocaleDateString()}
                      {c.dataPagamento && ` | ${t("pagoEm")}: ${new Date(c.dataPagamento).toLocaleDateString()}`}
                    </p>
                    {c.observacao && <p className="text-[9px] text-[var(--gray)] mt-0.5">{c.observacao}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-[var(--gold)]">R$ {(c.valor / 100).toFixed(2)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[c.status] || ""}`}>
                      {t(c.status)}
                    </span>
                    {c.status === "pendente" && (
                      <div className="flex gap-1 mt-1 justify-end">
                        <select onChange={e => { if (e.target.value) pagarCobranca(c.id, e.target.value); e.target.value = "" }}
                          className="text-[9px] px-1 py-0.5 rounded bg-black border border-[var(--dark-border)] text-white">
                          <option value="">{t("registrarPagamento")}</option>
                          {metodos.map(m => <option key={m} value={m}>{t(m)}</option>)}
                        </select>
                        <button onClick={() => cancelarCobranca(c.id)}
                          className="text-[9px] px-2 py-0.5 rounded bg-gray-900/30 text-gray-400">
                          {t("cancelar")}
                        </button>
                      </div>
                    )}
                    {c.status === "pago" && c.metodo && (
                      <p className="text-[9px] text-green-400 mt-1">{t("pagoVia")} {t(c.metodo)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"

export default function PlanosPage() {
  const [planos, setPlanos] = useState<any[]>([])
  const [nome, setNome] = useState("")
  const [valor, setValor] = useState("")
  const [descricao, setDescricao] = useState("")
  const [recorrencia, setRecorrencia] = useState("mensal")
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { fetch("/api/financeiro/planos").then(r => r.json()).then(setPlanos).catch(() => {}) }, [])

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    if (!nome || !valor) return
    const res = await fetch("/api/financeiro/planos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, valor: Number(valor), descricao, recorrencia }),
    })
    if (res.ok) {
      const novo = await res.json()
      setPlanos((prev) => [...prev, novo])
      setNome(""); setValor(""); setDescricao(""); setShowForm(false)
    }
  }

  return (
    <DashboardShell role="dono">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Planos de Mensalidade</h3>
            <p className="text-xs text-[var(--white-muted)]">Gerencie os planos da sua academia</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-gold px-4 py-2 text-sm font-bold">
            {showForm ? "✕ Cancelar" : "+ Novo Plano"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={criar} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide font-semibold">Nome do Plano</label>
                <input value={nome} onChange={(e) => setNome(e.target.value)} className="input-premium w-full text-sm mt-1" placeholder="Ex: Básico, Premium..." required />
              </div>
              <div>
                <label className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide font-semibold">Valor (R$)</label>
                <input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} className="input-premium w-full text-sm mt-1" placeholder="89,90" required />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide font-semibold">Descrição</label>
              <input value={descricao} onChange={(e) => setDescricao(e.target.value)} className="input-premium w-full text-sm mt-1" placeholder="Descrição do plano..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide font-semibold">Recorrência</label>
                <select value={recorrencia} onChange={(e) => setRecorrencia(e.target.value)} className="input-premium w-full text-sm mt-1">
                  <option value="mensal">Mensal</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="semestral">Semestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-gold px-6 py-2.5 text-sm font-bold">Salvar Plano</button>
          </form>
        )}

        <div className="space-y-3">
          {planos.map((p) => (
            <div key={p.id} className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold">{p.nome}</h4>
                  <p className="text-xs text-[var(--white-muted)] mt-0.5">{p.descricao || "Sem descrição"}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-[var(--gold)]">R$ {p.valor.toFixed(2)}</div>
                  <div className="text-[10px] text-[var(--white-muted)] uppercase">{p.recorrencia}</div>
                </div>
              </div>
            </div>
          ))}
          {planos.length === 0 && (
            <div className="text-center py-10 text-[var(--white-muted)] text-sm">
              Nenhum plano criado ainda. Crie seu primeiro plano!
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}

"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { useT } from "@/lib/use-t"
import { toast } from "sonner"
import { CardSkeleton } from "@/components/ui/skeleton"
import { BackButton } from "@/components/ui/back-button"

type Contrato = { id: string; aluno: { id: string; nome: string; faixa: string }; plano: { id: string; nome: string }; valor: number; dataInicio: string; status: string }
type Plano = { id: string; nome: string; valor: number; ativo: boolean }
type Aluno = { id: string; nome: string; faixa: string }

export default function ContratosPage() {
  const t = useT("dono.financeiro")
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [planos, setPlanos] = useState<Plano[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ alunoId: "", planoId: "", valor: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const [c, p, a] = await Promise.all([
        fetch("/api/financeiro/contratos").then(async r => { if (!r.ok) throw new Error("Erro ao carregar contratos"); return r.json() }),
        fetch("/api/financeiro/planos").then(async r => { if (!r.ok) throw new Error("Erro ao carregar planos"); return r.json() }),
        fetch("/api/academia/alunos").then(r => r.json()).catch(() => []),
      ])
      setContratos(c); setPlanos(p); setAlunos(a)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erro ao carregar dados"
      toast.error(message)
    }
    setLoading(false)
  }

  async function criarContrato(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const r = await fetch("/api/financeiro/contratos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (r.ok) {
      toast.success(t("contratoCriado"))
      setShowForm(false)
      setForm({ alunoId: "", planoId: "", valor: "" })
      load()
    } else {
      const err = await r.json()
      toast.error(err.error || t("erro"))
    }
    setSaving(false)
  }

  async function alterarStatus(id: string, status: string) {
    const r = await fetch(`/api/financeiro/contratos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (r.ok) {
      load()
      toast.success(t("contratoAtualizado"))
    }
  }

  const statusColors: Record<string, string> = {
    ativo: "bg-green-900/40 text-green-400",
    inadimplente: "bg-red-900/40 text-red-400",
    cancelado: "bg-[var(--border)] text-[var(--text-muted)]",
    encerrado: "bg-blue-900/40 text-blue-400",
  }

  return (
    <DashboardShell role="dono">
      <BackButton href="/dashboard/dono/financeiro" />
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="text-center">
          <h3 className="font-bold text-lg">{t("contratosTitle")}</h3>
          <button onClick={() => setShowForm(!showForm)}
            className="btn-primary px-4 py-2 text-sm mt-3">
            {showForm ? t("cancelar") : t("novoContrato")}
          </button>
        </div>

        {showForm && (
          <form onSubmit={criarContrato} className="glass-card p-4 space-y-3">
            <div>
              <label htmlFor="contrato-aluno" className="text-[11px] text-[var(--text-secondary)]">{t("aluno")}</label>
              <select id="contrato-aluno" value={form.alunoId} onChange={e => setForm({...form, alunoId: e.target.value})} required
                className="w-full input-field px-3 py-2.5 mt-1">
                <option value="">{t("selecioneAluno")}</option>
                {alunos.map((a: Aluno) => (
                  <option key={a.id} value={a.id}>{a.nome} - {a.faixa}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="contrato-plano" className="text-[11px] text-[var(--text-secondary)]">{t("plano")}</label>
              <select id="contrato-plano" value={form.planoId} onChange={e => {
                const plano = planos.find(p => p.id === e.target.value)
                setForm({...form, planoId: e.target.value, valor: plano ? (plano.valor / 100).toFixed(2) : "" })
              }} required
                className="w-full input-field px-3 py-2.5 mt-1">
                <option value="">{t("selecionePlano")}</option>
                {planos.filter(p => p.ativo).map((p: Plano) => (
                  <option key={p.id} value={p.id}>{p.nome} - R$ {(p.valor / 100).toFixed(2)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[var(--text-secondary)]">{t("valorContrato")}</label>
              <input type="number" step="0.01" min="0" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} required
                className="w-full input-field px-3 py-2.5 mt-1" />
            </div>
            <button type="submit" disabled={saving}
              className="w-full py-3 rounded-xl font-bold text-sm btn-gold disabled:opacity-50">
              {saving ? t("salvando") : t("criarContrato")}
            </button>
          </form>
        )}

        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
        ) : contratos.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-[var(--text-secondary)]">{t("nenhumContrato")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {contratos.map(c => (
              <div key={c.id} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{c.aluno.nome}</p>
                    <p className="text-[10px] text-[var(--text-secondary)]">{c.aluno.faixa} - {c.plano.nome}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{t("desde")} {new Date(c.dataInicio).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-[var(--gold)]">R$ {(c.valor / 100).toFixed(2)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[c.status] || ""}`}>
                      {t(c.status)}
                    </span>
                    <div className="flex gap-1 mt-1 justify-end">
                      {c.status === "ativo" && (
                        <button onClick={() => alterarStatus(c.id, "inadimplente")}
                          className="text-[10px] px-2.5 py-1 rounded bg-red-900/30 text-red-400">
                          {t("marcarInadimplente")}
                        </button>
                      )}
                      {(c.status === "ativo" || c.status === "inadimplente") && (
                        <button onClick={() => alterarStatus(c.id, "cancelado")}
                          className="text-[10px] px-2.5 py-1 rounded bg-[var(--border)] text-[var(--text-muted)]">
                          {t("cancelar")}
                        </button>
                      )}
                      {(c.status === "cancelado" || c.status === "encerrado") && (
                        <button onClick={() => alterarStatus(c.id, "ativo")}
                          className="text-[10px] px-2.5 py-1 rounded bg-green-900/30 text-green-400">
                          {t("reativar")}
                        </button>
                      )}
                      <button aria-label={`Excluir contrato de ${c.aluno.nome}`} onClick={async () => {
                        if (!confirm(`Excluir contrato de ${c.aluno.nome}?`)) return
                        const r = await fetch(`/api/financeiro/contratos/${c.id}`, { method: "DELETE" })
                        if (r.ok) { load(); toast.success("Contrato excluído") }
                        else { const err = await r.json().catch(() => ({})); toast.error(err.error || "Erro ao excluir") }
                      }}
                        className="text-xs px-3 py-1.5 rounded bg-red-900/20 text-red-400/70 hover:text-red-400 min-h-[36px]">🗑️</button>
                    </div>
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

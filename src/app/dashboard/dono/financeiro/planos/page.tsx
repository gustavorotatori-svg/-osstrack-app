"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { useT } from "@/lib/use-t"
import { toast } from "sonner"

export default function PlanosPage() {
  const t = useT("dono.financeiro")
  const [planos, setPlanos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: "", valor: "", taxaMatricula: "", descricao: "", periodo: "mensal" })
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const r = await fetch("/api/financeiro/planos")
    if (r.ok) { setPlanos(await r.json()) }
    setLoading(false)
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const body = { ...form, valor: parseFloat(form.valor) }
    const r = await fetch("/api/financeiro/planos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (r.ok) {
      toast.success(t("planoCriado"))
      setShowForm(false)
      setForm({ nome: "", valor: "", taxaMatricula: "", descricao: "", periodo: "mensal" })
      load()
    } else {
      const err = await r.json()
      toast.error(err.error || t("erro"))
    }
    setSaving(false)
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    const r = await fetch(`/api/financeiro/planos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !ativo }),
    })
    if (r.ok) { load(); toast.success(t("planoAtualizado")) }
  }

  const periodos = ["mensal", "trimestral", "semestral", "anual"]

  return (
    <DashboardShell role="dono">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="text-center">
          <h3 className="font-bold text-lg">{t("planosTitle")}</h3>
          <button onClick={() => setShowForm(!showForm)}
            className="btn-primary px-4 py-2 text-sm mt-3">
            {showForm ? t("cancelar") : t("novoPlano")}
          </button>
        </div>

        {showForm && (
          <form onSubmit={salvar} className="glass-card p-4 space-y-3">
            <div>
              <label className="text-[11px] text-[var(--white-muted)]">{t("nome")}</label>
              <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required
                className="w-full px-3 py-2.5 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm mt-1" />
            </div>
            <div>
              <label className="text-[11px] text-[var(--white-muted)]">{t("valor")}</label>
              <input type="number" step="0.01" min="0" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} required
                className="w-full px-3 py-2.5 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm mt-1" />
            </div>
            <div>
              <label className="text-[11px] text-[var(--white-muted)]">{t("taxaMatricula")}</label>
              <input type="number" step="0.01" min="0" value={form.taxaMatricula} onChange={e => setForm({...form, taxaMatricula: e.target.value})}
                className="w-full px-3 py-2.5 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm mt-1" />
            </div>
            <div>
              <label className="text-[11px] text-[var(--white-muted)]">{t("periodo")}</label>
              <select value={form.periodo} onChange={e => setForm({...form, periodo: e.target.value})}
                className="w-full px-3 py-2.5 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm mt-1">
                {periodos.map(p => <option key={p} value={p}>{t(p)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[var(--white-muted)]">{t("descricao")}</label>
              <textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} rows={2}
                className="w-full px-3 py-2.5 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm mt-1" />
            </div>
            <button type="submit" disabled={saving}
              className="w-full py-3 rounded-xl font-bold text-sm btn-gold disabled:opacity-50">
              {saving ? t("salvando") : t("criarPlano")}
            </button>
          </form>
        )}

        {loading ? (
          <div className="animate-pulse space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-[var(--dark-border)] rounded-xl" />)}</div>
        ) : planos.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-[var(--white-muted)]">{t("nenhumPlano")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {planos.map(p => (
              <div key={p.id} className={`glass-card p-4 ${!p.ativo ? "opacity-50" : ""}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{p.nome}</p>
                    <p className="text-xs text-[var(--white-muted)]">{t(p.periodo)}</p>
                    {p.descricao && <p className="text-[10px] text-[var(--gray)] mt-1">{p.descricao}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-[var(--gold)]">R$ {(p.valor / 100).toFixed(2)}</p>
                    {p.taxaMatricula > 0 && <p className="text-[10px] text-[var(--white-muted)]">+ R$ {(p.taxaMatricula / 100).toFixed(2)} {t("matricula")}</p>}
                    <button onClick={() => toggleAtivo(p.id, p.ativo)}
                      className={`text-[10px] mt-1 px-2 py-0.5 rounded-full ${p.ativo ? "bg-green-900/40 text-green-400" : "bg-gray-900/40 text-gray-400"}`}>
                      {p.ativo ? t("ativo") : t("inativo")}
                    </button>
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

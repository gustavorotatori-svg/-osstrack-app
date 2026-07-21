"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { useT } from "@/lib/use-t"
import { toast } from "sonner"
import { TrendingDown, Plus, X } from "lucide-react"
import { CardSkeleton } from "@/components/ui/skeleton"

export default function DespesasPage() {
  const t = useT("dono.financeiro")
  const [despesas, setDespesas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("todas")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ descricao: "", valor: "", categoria: "outras", dataVencimento: "", observacao: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const r = await fetch("/api/financeiro/despesas")
    if (r.ok) setDespesas(await r.json())
    setLoading(false)
  }

  async function criarDespesa(e: React.FormEvent) {
    e.preventDefault()
    if (!form.descricao || !form.valor || !form.dataVencimento) { toast.error(t("preenchaCampos")); return }
    setSaving(true)
    const r = await fetch("/api/financeiro/despesas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, valor: Math.round(Number(form.valor) * 100) }),
    })
    if (r.ok) {
      toast.success(t("despesaCriada"))
      setShowForm(false)
      setForm({ descricao: "", valor: "", categoria: "outras", dataVencimento: "", observacao: "" })
      load()
    } else {
      toast.error(t("erro"))
    }
    setSaving(false)
  }

  async function pagarDespesa(id: string) {
    const r = await fetch(`/api/financeiro/despesas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "pago" }),
    })
    if (r.ok) { load(); toast.success(t("despesaPaga")) }
    else { toast.error(t("erro")) }
  }

  async function cancelarDespesa(id: string) {
    const r = await fetch(`/api/financeiro/despesas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelado" }),
    })
    if (r.ok) { load(); toast.success(t("despesaCancelada")) }
  }

  async function excluirDespesa(id: string) {
    if (!window.confirm(t("confirmarExcluir"))) return
    const r = await fetch(`/api/financeiro/despesas/${id}`, { method: "DELETE" })
    if (r.ok) { load(); toast.success(t("despesaExcluida")) }
    else { toast.error(t("erro")) }
  }

  const filtradas = filter === "todas" ? despesas : despesas.filter(d => d.status === filter)

  const statusColors: Record<string, string> = {
    pendente: "bg-yellow-900/40 text-yellow-400",
    pago: "bg-green-900/40 text-green-400",
    cancelado: "bg-gray-900/40 text-gray-400",
  }

  const categorias = [
    { value: "aluguel", label: t("catAluguel") },
    { value: "salarios", label: t("catSalarios") },
    { value: "agua", label: t("catAgua") },
    { value: "luz", label: t("catLuz") },
    { value: "internet", label: t("catInternet") },
    { value: "material", label: t("catMaterial") },
    { value: "equipamentos", label: t("catEquipamentos") },
    { value: "marketing", label: t("catMarketing") },
    { value: "alimentacao", label: t("catAlimentacao") },
    { value: "impostos", label: t("catImpostos") },
    { value: "outras", label: t("catOutras") },
  ]

  const totalFiltrado = filtradas.reduce((acc, d) => acc + d.valor, 0)

  return (
    <DashboardShell role="dono">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-400" /> {t("despesasTitle")}
          </h3>
          <button onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold btn-danger">
            {showForm ? <X className="w-3.5 h-3.5 inline" /> : <Plus className="w-3.5 h-3.5 inline" />}
            {showForm ? t("fechar") : t("novaDespesa")}
          </button>
        </div>

        {showForm && (
          <form onSubmit={criarDespesa} className="glass-card p-4 space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-[var(--text-secondary)] block mb-1">{t("descricao")}</label>
              <input className="input-field" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder={t("descricaoPlaceholder")} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-[var(--text-secondary)] block mb-1">{t("valor")}</label>
                <input type="number" step="0.01" className="input-field" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} placeholder="0,00" required />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-[var(--text-secondary)] block mb-1">{t("categoria")}</label>
                <select className="input-field" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                  {categorias.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[var(--text-secondary)] block mb-1">{t("dataVencimento")}</label>
              <input type="date" className="input-field" value={form.dataVencimento} onChange={e => setForm(f => ({ ...f, dataVencimento: e.target.value }))} required />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[var(--text-secondary)] block mb-1">{t("observacao")}</label>
              <input className="input-field" value={form.observacao} onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))} placeholder={t("obsPlaceholder")} />
            </div>
            <button type="submit" disabled={saving}
              className="w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50 btn-danger">
              {saving ? t("salvando") : t("criarDespesa")}
            </button>
          </form>
        )}

        <div className="flex gap-1 bg-[var(--border)] rounded-lg p-1 overflow-x-auto">
          {["todas", "pendente", "pago", "cancelado"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-semibold whitespace-nowrap ${filter === s ? "bg-red-500 text-white" : "text-[var(--text-secondary)]"}`}>
              {t(s)} {s === "todas" && `(${despesas.length})`}
            </button>
          ))}
        </div>

        {filter === "todas" && totalFiltrado > 0 && (
          <div className="glass-card p-3 flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)]">{t("totalFiltrado")}</span>
            <span className="text-lg font-extrabold text-red-400">R$ {(totalFiltrado / 100).toFixed(2)}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
        ) : filtradas.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-[var(--text-secondary)]">{t("nenhumaDespesa")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtradas.map(d => (
              <div key={d.id} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{d.descricao}</p>
                    <p className="text-[10px] text-[var(--text-secondary)]">{categorias.find(c => c.value === d.categoria)?.label || d.categoria}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {t("vencimento")}: {new Date(d.dataVencimento).toLocaleDateString()}
                      {d.dataPagamento && ` | ${t("pagoEm")}: ${new Date(d.dataPagamento).toLocaleDateString()}`}
                    </p>
                    {d.observacao && <p className="text-[9px] text-[var(--text-muted)] mt-0.5">{d.observacao}</p>}
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-lg font-extrabold text-red-400">-R$ {(d.valor / 100).toFixed(2)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[d.status] || ""}`}>
                      {t(d.status)}
                    </span>
                    {d.status === "pendente" && (
                      <div className="flex gap-1 mt-1 justify-end">
                        <button onClick={() => pagarDespesa(d.id)}
                          className="text-[9px] px-2 py-0.5 rounded bg-green-900/30 text-green-400">
                          {t("pagar")}
                        </button>
                        <button onClick={() => cancelarDespesa(d.id)}
                          className="text-[9px] px-2 py-0.5 rounded bg-gray-900/30 text-gray-400">
                          {t("cancelar")}
                        </button>
                        <button onClick={() => excluirDespesa(d.id)}
                          className="text-[9px] px-2 py-0.5 rounded bg-red-900/30 text-red-400">
                          {t("excluir")}
                        </button>
                      </div>
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

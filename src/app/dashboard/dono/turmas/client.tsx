"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { PageTransition } from "@/components/ui/page-transition"
import { toast } from "sonner"

type Turma = {
  id: string
  nome: string
  descricao: string | null
  cor: string
  icone: string
  categoria: string
  maxAlunos: number
  _count: { alunos: number; horarios: number }
}

const CATEGORIAS = ["adulto", "infantil", "iniciante"]
const CORES = [
  { label: "Dourado", value: "#C9A84C" },
  { label: "Vermelho", value: "#8B0000" },
  { label: "Azul", value: "#2563EB" },
  { label: "Verde", value: "#16A34A" },
  { label: "Roxo", value: "#9333EA" },
  { label: "Laranja", value: "#EA580C" },
  { label: "Cinza", value: "#6B7280" },
]
const ICONES = ["🥋", "🟦", "🟥", "🟨", "🟢", "👶", "💪", "🔥", "⚔️", "🛡️"]

export function TurmasClient({ role = "dono" }: { role?: string }) {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [cor, setCor] = useState("#C9A84C")
  const [icone, setIcone] = useState("🥋")
  const [categoria, setCategoria] = useState("adulto")
  const [maxAlunos, setMaxAlunos] = useState(30)
  const [saving, setSaving] = useState(false)

  const fetchTurmas = useCallback(async () => {
    try {
      const res = await globalThis.fetch("/api/turmas")
      if (res.ok) setTurmas(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchTurmas() }, [fetchTurmas])

  function resetForm() {
    setNome("")
    setDescricao("")
    setCor("#C9A84C")
    setIcone("🥋")
    setCategoria("adulto")
    setMaxAlunos(30)
    setEditingId(null)
  }

  function openEdit(t: Turma) {
    setNome(t.nome)
    setDescricao(t.descricao || "")
    setCor(t.cor)
    setIcone(t.icone)
    setCategoria(t.categoria)
    setMaxAlunos(t.maxAlunos)
    setEditingId(t.id)
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        const res = await fetch(`/api/turmas/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, descricao, cor, icone, categoria, maxAlunos }),
        })
        if (!res.ok) throw new Error()
        toast.success("Turma atualizada!")
      } else {
        const res = await fetch("/api/turmas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, descricao, cor, icone, categoria, maxAlunos }),
        })
        if (!res.ok) throw new Error()
        toast.success("Turma criada!")
      }
      setShowForm(false)
      resetForm()
      fetchTurmas()
    } catch {
      toast.error("Erro ao salvar turma")
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta turma?")) return
    try {
      const res = await fetch(`/api/turmas/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setTurmas((prev) => prev.filter((t) => t.id !== id))
      toast.success("Turma excluída")
    } catch {
      toast.error("Erro ao excluir turma")
    }
  }

  return (
    <DashboardShell role={role}>
      <PageTransition>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">📋 Turmas</h3>
              <p className="text-xs text-[var(--white-muted)]">Gerencie os tipos de aula da academia</p>
            </div>
            <button onClick={() => { resetForm(); setShowForm(!showForm) }}
              className="btn-gold px-4 py-2 text-sm">
              {showForm ? "✕ Fechar" : "+ Nova Turma"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSave}
              className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-5 space-y-4">
              <h4 className="font-bold text-sm">{editingId ? "Editar Turma" : "Nova Turma"}</h4>

              <div>
                <label className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide font-semibold">Nome</label>
                <input value={nome} onChange={(e) => setNome(e.target.value)}
                  className="input-premium w-full text-sm mt-1" placeholder="Ex: Jiu-Jitsu GI" required />
              </div>

              <div>
                <label className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide font-semibold">Descrição</label>
                <input value={descricao} onChange={(e) => setDescricao(e.target.value)}
                  className="input-premium w-full text-sm mt-1" placeholder="Ex: Treino com kimono tradicional" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide font-semibold">Categoria</label>
                  <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
                    className="input-premium w-full text-sm mt-1">
                    {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide font-semibold">Máx. Alunos</label>
                  <input type="number" value={maxAlunos} onChange={(e) => setMaxAlunos(Number(e.target.value))}
                    className="input-premium w-full text-sm mt-1" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide font-semibold mb-2 block">Cor</label>
                <div className="flex gap-2 flex-wrap">
                  {CORES.map((c) => (
                    <button key={c.value} type="button" onClick={() => setCor(c.value)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${cor === c.value ? "border-white scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c.value }} title={c.label} />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide font-semibold mb-2 block">Ícone</label>
                <div className="flex gap-2 flex-wrap">
                  {ICONES.map((ic) => (
                    <button key={ic} type="button" onClick={() => setIcone(ic)}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-all ${icone === ic ? "border-[var(--gold)] bg-[rgba(201,168,76,0.1)]" : "border-transparent"}`}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={saving}
                  className="btn-gold px-6 py-2.5 text-sm font-bold">
                  {saving ? "Salvando..." : editingId ? "Atualizar" : "Criar Turma"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); resetForm() }}
                  className="px-4 py-2.5 text-sm text-[var(--white-muted)] border border-[var(--dark-border)] rounded-xl">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-20 text-[var(--white-muted)] text-sm">Carregando...</div>
          ) : turmas.length === 0 ? (
            <div className="glass-card text-center py-12">
              <div className="text-4xl mb-3 opacity-30">📋</div>
              <div className="text-base font-bold">Nenhuma turma ainda</div>
              <div className="text-sm text-[var(--white-muted)] mt-1">Crie sua primeira turma para começar a organizar os horários.</div>
            </div>
          ) : (
            <div className="grid-modern">
              {turmas.map((t) => (
                <div key={t.id} className="glass-card hover-lift">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${t.cor}15` }}>
                      {t.icone}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold truncate">{t.nome}</div>
                      {t.descricao && <div className="text-xs text-[var(--white-muted)] truncate">{t.descricao}</div>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(t)}
                        className="w-8 h-8 rounded-lg bg-[var(--dark-border)] flex items-center justify-center text-xs hover:border-[var(--gold)] border border-transparent transition-all">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(t.id)}
                        className="w-8 h-8 rounded-lg bg-[var(--dark-border)] flex items-center justify-center text-xs hover:border-red-500 border border-transparent transition-all">
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs text-[var(--white-muted)]">
                    <span>👥 {t._count.alunos} alunos</span>
                    <span>📅 {t._count.horarios} horários</span>
                    <span className={`capitalize ${t.categoria === "infantil" ? "text-yellow-400" : t.categoria === "iniciante" ? "text-emerald-400" : "text-[var(--gold)]"}`}>
                      {t.categoria}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

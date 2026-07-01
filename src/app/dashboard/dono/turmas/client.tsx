"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { PageTransition } from "@/components/ui/page-transition"
import { toast } from "sonner"
import { PencilIcon, Trash2Icon, ClipboardIcon, UsersIcon, CalendarIcon, SmartphoneIcon, XIcon } from "@/components/ui/icons"
import { useT } from "@/lib/use-t"

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

type AlunoItem = { id: string; nome: string; faixa: string; grau: number }

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
const FAIXAS = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]

export function TurmasClient({ role = "dono" }: { role?: string }) {
   const tr = useT("dono.turmas")
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

  // Student management
  const [alunosPanel, setAlunosPanel] = useState<string | null>(null)
  const [alunosNaTurma, setAlunosNaTurma] = useState<AlunoItem[]>([])
  const [todosAlunos, setTodosAlunos] = useState<AlunoItem[]>([])
  const [loadingAlunos, setLoadingAlunos] = useState(false)

  const fetchTurmas = useCallback(async () => {
    try {
      const res = await fetch("/api/turmas")
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
        toast.success(tr("turmaAtualizada"))
      } else {
        const res = await fetch("/api/turmas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, descricao, cor, icone, categoria, maxAlunos }),
        })
        if (!res.ok) throw new Error()
        toast.success(tr("turmaCriada"))
      }
      setShowForm(false)
      resetForm()
      fetchTurmas()
    } catch {
      toast.error(tr("erroSalvar"))
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm(tr("confirmarExcluir"))) return
    try {
      const res = await fetch(`/api/turmas/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setTurmas((prev) => prev.filter((t) => t.id !== id))
      toast.success(tr("turmaExcluida"))
    } catch {
      toast.error(tr("erroExcluir"))
    }
  }

  async function openAlunosPanel(turmaId: string) {
    setAlunosPanel(turmaId)
    setLoadingAlunos(true)
    try {
      const res = await fetch(`/api/turmas/${turmaId}/alunos`)
      if (res.ok) {
        const data = await res.json()
        setAlunosNaTurma(data.alunosNaTurma)
        setTodosAlunos(data.todosAlunos)
      }
    } catch { /* ignore */ }
    setLoadingAlunos(false)
  }

  async function adicionarAluno(turmaId: string, alunoId: string) {
    try {
      const res = await fetch(`/api/turmas/${turmaId}/alunos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alunoId }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || tr("erroAdicionar"))
        return
      }
      toast.success(tr("alunoAdicionado"))
      setAlunosNaTurma((prev) => [...prev, todosAlunos.find((a) => a.id === alunoId)!])
      setTodosAlunos((prev) => prev.filter((a) => a.id !== alunoId))
      fetchTurmas()
    } catch {
      toast.error(tr("erroAdicionar"))
    }
  }

  async function removerAluno(turmaId: string, alunoId: string) {
    try {
      const res = await fetch(`/api/turmas/${turmaId}/alunos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alunoId }),
      })
      if (!res.ok) throw new Error()
      toast.success(tr("alunoRemovido"))
      setAlunosNaTurma((prev) => prev.filter((a) => a.id !== alunoId))
      setTodosAlunos((prev) => [...prev, alunosNaTurma.find((a) => a.id === alunoId)!].sort((a, b) => a.nome.localeCompare(b.nome)))
      fetchTurmas()
    } catch {
      toast.error(tr("erroRemover"))
    }
  }

  function getBeltColor(faixa: string): string {
    const colors: Record<string, string> = {
      Branca: "bg-gray-100 text-gray-800", Azul: "bg-blue-600 text-white",
      Roxa: "bg-purple-600 text-white", Marrom: "bg-amber-700 text-white",
      Preta: "bg-gray-900 text-white",
    }
    return colors[faixa] || "bg-gray-100 text-gray-800"
  }

  function compartilharTurma(t: Turma) {
    const baseUrl = window.location.origin
    const msg = `${tr("compartilharMsg")} ${t.nome} ${baseUrl}/cadastro`
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(url, "_blank")
  }

  return (
    <DashboardShell role={role}>
      <PageTransition>
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="text-center">
            <h3 className="font-bold text-lg">{tr("title")}</h3>
            <p className="text-xs text-[var(--text-secondary)]">{tr("subtitle")}</p>
            <button onClick={() => { resetForm(); setShowForm(!showForm) }}
              className="btn-primary px-4 py-2 text-sm mt-3">
              {showForm ? <><XIcon className="w-4 h-4 inline -mt-0.5" /> {tr("fechar")}</> : tr("novaTurma")}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSave}
              className="glass-card p-5 space-y-4">
              <h4 className="font-bold text-sm">{editingId ? tr("editarTurma") : tr("novaTurma")}</h4>

              <div>
                <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold">{tr("nome")}</label>
                <input value={nome} onChange={(e) => setNome(e.target.value)}
                  className="input-field w-full text-sm mt-1" placeholder={tr("placeholderNome")} required />
              </div>

              <div>
                <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold">{tr("descricao")}</label>
                <input value={descricao} onChange={(e) => setDescricao(e.target.value)}
                  className="input-field w-full text-sm mt-1" placeholder={tr("placeholderDesc")} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold">{tr("categoria")}</label>
                  <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
                    className="input-field w-full text-sm mt-1">
                    {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold">{tr("maxAlunos")}</label>
                  <input type="number" value={maxAlunos} onChange={(e) => setMaxAlunos(Number(e.target.value))}
                    className="input-field w-full text-sm mt-1" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold mb-2 block">Cor</label>
                <div className="flex gap-2 flex-wrap">
                  {CORES.map((c) => (
                    <button key={c.value} type="button" onClick={() => setCor(c.value)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${cor === c.value ? "border-white scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c.value }} title={c.label} />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold mb-2 block">Ícone</label>
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
                  {saving ? tr("salvando") : editingId ? tr("atualizar") : tr("criarTurma")}
                </button>
                <button type="button" onClick={() => { setShowForm(false); resetForm() }}
                  className="px-4 py-2.5 text-sm text-[var(--text-secondary)] border border-[var(--border)] rounded-xl">
                  {tr("cancelar")}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-20 text-[var(--text-secondary)] text-sm">{tr("carregando")}</div>
          ) : turmas.length === 0 ? (
            <div className="glass-card text-center py-12">
              <ClipboardIcon className="w-10 h-10 mb-3 opacity-30 mx-auto" />
              <div className="text-base font-bold">{tr("nenhumaTurma")}</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">{tr("descEmpty")}</div>
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
                      {t.descricao && <div className="text-xs text-[var(--text-secondary)] truncate">{t.descricao}</div>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(t)}
                        className="w-8 h-8 rounded-lg bg-[var(--border)] flex items-center justify-center text-xs hover:border-[var(--gold)] border border-transparent transition-all">
                        <PencilIcon className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(t.id)}
                        className="w-8 h-8 rounded-lg bg-[var(--border)] flex items-center justify-center text-xs hover:border-red-500 border border-transparent transition-all">
                        <Trash2Icon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs text-[var(--text-secondary)]">
                    <span><UsersIcon className="w-3 h-3 inline -mt-0.5 mr-0.5" /> {t._count.alunos} {tr("alunos")}</span>
                    <span><CalendarIcon className="w-3 h-3 inline -mt-0.5 mr-0.5" /> {t._count.horarios} {tr("horarios")}</span>
                    <span className={`capitalize ${t.categoria === "infantil" ? "text-yellow-400" : t.categoria === "iniciante" ? "text-emerald-400" : "text-[var(--gold)]"}`}>
                      {t.categoria}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                    <button onClick={() => openAlunosPanel(t.id)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[var(--border)] hover:bg-[rgba(201,168,76,0.1)] hover:text-[var(--gold)] transition-all">
                      <UsersIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" /> {tr("gerenciarAlunos")}
                    </button>
                    <button onClick={() => compartilharTurma(t)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold bg-green-600/15 text-green-400 hover:bg-green-600/25 transition-all">
                      <SmartphoneIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" /> {tr("convidar")}
                    </button>
                  </div>

                  {/* Student management panel */}
                  {alunosPanel === t.id && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-3">
                      <h4 className="text-sm font-bold"><UsersIcon className="w-4 h-4 inline -mt-0.5 mr-1" />{tr("alunosNaTurma")}</h4>
                      {loadingAlunos ? (
                        <p className="text-xs text-[var(--text-secondary)] text-center py-4">{tr("carregando")}</p>
                      ) : (
                        <>
                          {alunosNaTurma.length === 0 ? (
                            <p className="text-xs text-[var(--text-secondary)] text-center py-3">{tr("nenhumAluno")}</p>
                          ) : (
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                              {alunosNaTurma.map((a) => (
                                <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--dark-card)]">
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${getBeltColor(a.faixa)}`}>
                                      {a.faixa}
                                    </span>
                                    <span className="text-sm font-medium">{a.nome}</span>
                                  </div>
                                  <button onClick={() => removerAluno(t.id, a.id)}
                                    className="text-xs text-red-400 hover:text-red-300 transition-colors">
                                    <XIcon className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <h4 className="text-sm font-bold mt-2"><ClipboardIcon className="w-4 h-4 inline -mt-0.5 mr-1" />{tr("adicionarAlunos")}</h4>
                          {todosAlunos.length === 0 ? (
                            <p className="text-xs text-[var(--text-secondary)] text-center py-3">{tr("nenhumDisponivel")}</p>
                          ) : (
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                              {todosAlunos.filter((a) => !alunosNaTurma.find((na) => na.id === a.id)).map((a) => (
                                <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--border)] transition-all cursor-pointer"
                                  onClick={() => adicionarAluno(t.id, a.id)}>
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${getBeltColor(a.faixa)}`}>
                                      {a.faixa}
                                    </span>
                                    <span className="text-sm">{a.nome}</span>
                                  </div>
                                  <span className="text-xs text-[var(--gold)]">{tr("adicionar")}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

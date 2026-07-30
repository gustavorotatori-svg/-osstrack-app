"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { PageTransition } from "@/components/ui/page-transition"
import { toast } from "sonner"
import { PencilIcon, Trash2Icon, UsersIcon, XIcon, SearchIcon } from "@/components/ui/icons"
import { getBeltColor } from "@/lib/utils"

type Familia = {
  id: string
  nome: string
  desconto: number
  _count: { membros: number }
}

type AlunoItem = { id: string; nome: string; faixa: string; grau: number }

const FAIXAS = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]

export function FamiliaClient() {
  const [familias, setFamilias] = useState<Familia[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [nome, setNome] = useState("")
  const [desconto, setDesconto] = useState(10)
  const [saving, setSaving] = useState(false)

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [membrosNaFamilia, setMembrosNaFamilia] = useState<AlunoItem[]>([])
  const [todosAlunos, setTodosAlunos] = useState<AlunoItem[]>([])
  const [loadingMembros, setLoadingMembros] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchFamilias = useCallback(async () => {
    try {
      const res = await fetch("/api/familia")
      if (res.ok) setFamilias(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchFamilias() }, [fetchFamilias])

  function resetForm() {
    setNome("")
    setDesconto(10)
    setEditingId(null)
  }

  function openEdit(f: Familia) {
    setNome(f.nome)
    setDesconto(f.desconto)
    setEditingId(f.id)
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        const res = await fetch(`/api/familia/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, desconto }),
        })
        if (!res.ok) throw new Error()
        toast.success("Família atualizada")
      } else {
        const res = await fetch("/api/familia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, desconto }),
        })
        if (!res.ok) throw new Error()
        toast.success("Família criada")
      }
      setShowForm(false)
      resetForm()
      fetchFamilias()
    } catch {
      toast.error("Erro ao salvar")
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta família?")) return
    try {
      const res = await fetch(`/api/familia/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setFamilias((prev) => prev.filter((f) => f.id !== id))
      toast.success("Família excluída")
    } catch {
      toast.error("Erro ao excluir")
    }
  }

  async function openMembrosPanel(id: string) {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    setLoadingMembros(true)
    setSearchTerm("")
    try {
      const res = await fetch(`/api/familia/${id}/membros`)
      if (res.ok) {
        const data = await res.json()
        setMembrosNaFamilia(data.membrosNaFamilia)
        setTodosAlunos(data.todosAlunos)
      }
    } catch { /* ignore */ }
    setLoadingMembros(false)
  }

  async function adicionarMembro(familiaId: string, alunoId: string) {
    try {
      const res = await fetch(`/api/familia/${familiaId}/membros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alunoId }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Erro ao adicionar")
        return
      }
      toast.success("Membro adicionado")
      setMembrosNaFamilia((prev) => [...prev, todosAlunos.find((a) => a.id === alunoId)!])
      setTodosAlunos((prev) => prev.filter((a) => a.id !== alunoId))
      fetchFamilias()
    } catch {
      toast.error("Erro ao adicionar")
    }
  }

  async function removerMembro(familiaId: string, membroId: string, aluno: AlunoItem) {
    try {
      const res = await fetch(`/api/familia/${familiaId}/membros/${membroId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Membro removido")
      setMembrosNaFamilia((prev) => prev.filter((a) => a.id !== aluno.id))
      setTodosAlunos((prev) => [...prev, aluno].sort((a, b) => a.nome.localeCompare(b.nome)))
      fetchFamilias()
    } catch {
      toast.error("Erro ao remover")
    }
  }

  async function getMembroIdByAlunoId(familiaId: string, alunoId: string): Promise<string | null> {
    try {
      const res = await fetch(`/api/familia/${familiaId}`)
      if (res.ok) {
        const data = await res.json()
        const m = data.membros.find((m: any) => m.alunoId === alunoId)
        return m?.id || null
      }
    } catch { /* ignore */ }
    return null
  }

  const filteredAlunos = todosAlunos.filter((a) =>
    a.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardShell role="dono">
      <PageTransition>
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="text-center">
            <h3 className="font-bold text-lg">Famílias</h3>
            <p className="text-xs text-[var(--text-secondary)]">Grupos familiares com desconto</p>
            <button onClick={() => { resetForm(); setShowForm(!showForm) }}
              className="btn-primary px-4 py-2 text-sm mt-3">
              {showForm ? <><XIcon className="w-4 h-4 inline -mt-0.5" /> Fechar</> : "Nova Família"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSave} className="glass-card p-5 space-y-4">
              <h4 className="font-bold text-sm">{editingId ? "Editar Família" : "Nova Família"}</h4>
              <div>
                <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold">Nome</label>
                <input value={nome} onChange={(e) => setNome(e.target.value)}
                  className="input-field w-full text-sm mt-1" placeholder="Ex: Família Silva" required />
              </div>
              <div>
                <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold">Desconto (%)</label>
                <input type="number" min={0} max={100} value={desconto}
                  onChange={(e) => setDesconto(Number(e.target.value))}
                  className="input-field w-full text-sm mt-1" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving}
                  className="btn-gold px-6 py-2.5 text-sm font-bold">
                  {saving ? "Salvando..." : editingId ? "Atualizar" : "Criar Família"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); resetForm() }}
                  className="px-4 py-2.5 text-sm text-[var(--text-secondary)] border border-[var(--border)] rounded-xl">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5 space-y-3">
                  <div className="belt-loading rounded-lg h-5 w-3/4" />
                  <div className="belt-loading rounded-lg h-3 w-1/2" />
                  <div className="belt-loading rounded-lg h-20 w-full" />
                </div>
              ))}
            </div>
          ) : familias.length === 0 ? (
            <div className="glass-card text-center py-12">
              <UsersIcon className="w-10 h-10 mb-3 opacity-30 mx-auto" />
              <div className="text-base font-bold">Nenhuma família</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">
                Crie grupos familiares para oferecer descontos
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {familias.map((f) => (
                <div key={f.id} className="glass-card hover-lift">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: "rgba(201,168,76,0.15)" }}>
                      <UsersIcon className="w-5 h-5 text-[var(--gold)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold truncate">{f.nome}</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {f.desconto}% de desconto • {f._count.membros} {f._count.membros === 1 ? "membro" : "membros"}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(f)}
                        className="w-10 h-10 rounded-lg bg-[var(--border)] flex items-center justify-center hover:border-[var(--gold)] border border-transparent transition-all">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(f.id)}
                        className="w-10 h-10 rounded-lg bg-[var(--border)] flex items-center justify-center hover:border-red-500 border border-transparent transition-all">
                        <Trash2Icon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button onClick={() => openMembrosPanel(f.id)}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[var(--border)] hover:bg-[rgba(201,168,76,0.1)] hover:text-[var(--gold)] transition-all min-h-[44px]">
                    <UsersIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
                    {expandedId === f.id ? "Fechar" : "Gerenciar Membros"}
                  </button>

                  {expandedId === f.id && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-3">
                      <h4 className="text-sm font-bold">
                        <UsersIcon className="w-4 h-4 inline -mt-0.5 mr-1" />Membros
                      </h4>

                      {loadingMembros ? (
                        <p className="text-xs text-[var(--text-secondary)] text-center py-4">Carregando...</p>
                      ) : (
                        <>
                          {membrosNaFamilia.length === 0 ? (
                            <p className="text-xs text-[var(--text-secondary)] text-center py-3">Nenhum membro</p>
                          ) : (
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                              {membrosNaFamilia.map((a) => (
                                <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--dark-card)]">
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${getBeltColor(a.faixa)}`}>
                                      {a.faixa}
                                    </span>
                                    <span className="text-sm font-medium">{a.nome}</span>
                                  </div>
                                  <button onClick={async () => {
                                    const membroId = await getMembroIdByAlunoId(f.id, a.id)
                                    if (membroId) removerMembro(f.id, membroId, a)
                                  }}
                                    className="text-xs text-red-400 hover:text-red-300 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center">
                                    <XIcon className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="relative">
                            <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                            <input
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="input-field w-full text-sm pl-9"
                              placeholder="Buscar aluno..."
                            />
                          </div>

                          <h4 className="text-sm font-bold mt-2">Adicionar Membros</h4>
                          {filteredAlunos.length === 0 ? (
                            <p className="text-xs text-[var(--text-secondary)] text-center py-3">
                              {searchTerm ? "Nenhum aluno encontrado" : "Nenhum aluno disponível"}
                            </p>
                          ) : (
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                              {filteredAlunos.filter((a) => !membrosNaFamilia.find((m) => m.id === a.id)).map((a) => (
                                <div key={a.id}
                                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--border)] transition-all cursor-pointer"
                                  onClick={() => adicionarMembro(f.id, a.id)}>
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${getBeltColor(a.faixa)}`}>
                                      {a.faixa}
                                    </span>
                                    <span className="text-sm">{a.nome}</span>
                                  </div>
                                  <span className="text-[var(--gold)] font-bold">+</span>
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

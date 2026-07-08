"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { PageTransition } from "@/components/ui/page-transition"
import { Avatar } from "@/components/ui/avatar"
import { Search, X, Trash2, UserPlus } from "lucide-react"
import { getBeltColor } from "@/lib/utils"

type ProfessorData = {
  id: string
  nome: string
  email: string
  telefone: string | null
  faixa: string
  grau: number
  avatar: string | null
  dataInicio: string | null
  totalAlunos: number
  totalPresencas: number
  totalTurmas: number
}

export function ProfessoresClient() {
  const [professores, setProfessores] = useState<ProfessorData[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [removendo, setRemovendo] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch("/api/professores/vinculados")
      .then((r) => r.json())
      .then((d) => setProfessores(d.professores || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleRemover(id: string, nome: string) {
    if (!confirm(`Remover ${nome} da academia? Ele perderá acesso às turmas e dados da academia.`)) return
    setRemovendo(id)
    const res = await fetch("/api/professores/remover-vinculo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ professorId: id }),
    })
    if (res.ok) {
      setProfessores((prev) => prev.filter((p) => p.id !== id))
    }
    setRemovendo(null)
  }

  const filtrados = professores.filter((p) => {
    if (busca && !p.nome.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  return (
    <DashboardShell role="dono">
      <PageTransition>
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="text-center">
            <h3 className="font-bold text-lg">Professores</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {professores.length} professor{professores.length !== 1 ? "es" : ""} vinculado{professores.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Buscar professor..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="input-field w-full text-sm pl-9"
            />
            {busca && (
              <button onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="surface p-4 animate-pulse flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-32 bg-white/5 rounded" />
                    <div className="h-3 w-20 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-[var(--text-secondary)]">
                {busca ? "Nenhum professor encontrado" : "Nenhum professor vinculado ainda"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtrados.map((p) => (
                <div key={p.id} className="surface p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.nome} faixa={p.faixa} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{p.nome}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getBeltColor(p.faixa)}`}>
                          {p.faixa}
                        </span>
                        {p.grau > 0 && (
                          <span className="text-[10px] text-[var(--text-muted)]">{'★'.repeat(p.grau)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--text-secondary)]">
                        <span>{p.email}</span>
                        {p.telefone && <span>{p.telefone}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemover(p.id, p.nome)}
                      disabled={removendo === p.id}
                      className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      title="Remover professor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-4 mt-3 pt-3 border-t border-white/5 text-xs text-[var(--text-secondary)]">
                    <span><strong className="text-white">{p.totalAlunos}</strong> alunos</span>
                    <span><strong className="text-white">{p.totalTurmas}</strong> turmas</span>
                    <span><strong className="text-white">{p.totalPresencas}</strong> presenças</span>
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

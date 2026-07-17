"use client"

import { useState, useEffect } from "react"
import { CrownIcon, SearchIcon, XIcon } from "@/components/ui/icons"
import { Avatar } from "@/components/ui/avatar"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"
import { toast } from "sonner"

type Aluno = {
  id: string
  nome: string
  faixa: string
  grau: number
  categoria: string
}

type MestreData = {
  nome: string
  faixa: string
  avatar: string | null
  totalAulas: number
  mes: number
  ano: number
} | null

const CATEGORIAS = ["adulto", "master", "infantil"]
const CATEGORIA_LABELS: Record<string, string> = { adulto: "🥋 Adulto", master: "🏆 Master", infantil: "⭐ Infantil" }
const CATEGORIA_KEYS: Record<string, string> = { adulto: "adulto", master: "master", infantil: "infantil" }

export function MestreDoMesSelector() {
  const [mestres, setMestres] = useState<Record<string, MestreData>>({})
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [categoriaAtiva, setCategoriaAtiva] = useState("adulto")
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/mestredomes/meu")
      .then((r) => r.json())
      .then((d) => { setMestres(d.mestres || {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function openSelector() {
    setOpen(true)
    setSearch("")
    setCategoriaAtiva("adulto")
    try {
      const res = await fetch("/api/academia/alunos")
      const data = await res.json()
      setAlunos(data.alunos || data || [])
    } catch {
      setAlunos([])
    }
  }

  async function selectAluno(alunoId: string) {
    setSaving(true)
    try {
      const res = await fetch("/api/mestredomes/selecionar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alunoId, categoria: categoriaAtiva }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMestres((prev) => ({ ...prev, [categoriaAtiva]: data.mestre }))
      setOpen(false)
      toast.success(`${CATEGORIA_LABELS[categoriaAtiva]} — Aluno do Mês atualizado!`)
    } catch {
      toast.error("Erro ao selecionar aluno")
    } finally {
      setSaving(false)
    }
  }

  const filtered = alunos.filter((a) => {
    const matchNome = a.nome.toLowerCase().includes(search.toLowerCase())
    const matchCategoria = a.categoria === categoriaAtiva
    return matchNome && matchCategoria
  })

  if (loading) return null

  return (
    <>
      <div className="glass-card p-5 relative overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 bg-[var(--gold)]/5 rounded-full blur-3xl" />
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-[var(--gold)]/10 flex items-center justify-center mx-auto mb-2">
            <CrownIcon className="w-6 h-6 text-[var(--gold)]" />
          </div>
          <h3 className="font-bold text-base text-center">Aluno do Mês</h3>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {CATEGORIAS.map((cat) => {
              const m = mestres[cat]
              return (
                <div key={cat} className="rounded-xl p-3 text-center border border-[rgba(255,255,255,0.04)]" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: cat === "adulto" ? "#60a5fa" : cat === "master" ? "#a855f7" : "#f97316" }}>
                    {CATEGORIA_LABELS[cat]}
                  </div>
                  {m ? (
                    <>
                      <p className="text-sm font-extrabold truncate text-[var(--gold)]">{m.nome}</p>
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold mt-1 ${getBeltColor(m.faixa)}`}>
                        {getBeltEmoji(m.faixa)} {m.faixa}
                      </span>
                    </>
                  ) : (
                    <p className="text-[10px] text-[var(--text-muted)]">Vazio</p>
                  )}
                </div>
              )
            })}
          </div>

          <button
            onClick={openSelector}
            disabled={saving}
            className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20 hover:bg-[var(--gold)]/20 transition-all active:scale-[0.97]"
          >
            Gerenciar Alunos do Mês
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm glass-card p-5 animate-slide-up max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm">Selecionar Aluno do Mês</h4>
              <button onClick={() => setOpen(false)} className="p-2.5 rounded-lg hover:bg-[var(--surface)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 mb-3">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategoriaAtiva(cat); setSearch("") }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                    categoriaAtiva === cat
                      ? "bg-[var(--gold)] text-black shadow-md"
                      : "bg-[var(--surface)] text-[var(--text-muted)]"
                  }`}
                >
                  {CATEGORIA_LABELS[cat]}
                </button>
              ))}
            </div>

            <div className="relative mb-3">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Buscar aluno..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field w-full pl-9 pr-3 py-2.5 text-sm"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 scrollbar-none">
              {filtered.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)] text-center py-8">Nenhum aluno encontrado nesta categoria</p>
              ) : (
                filtered.map((a) => {
                  const isSelected = mestres[categoriaAtiva]?.nome === a.nome
                  return (
                    <button
                      key={a.id}
                      onClick={() => selectAluno(a.id)}
                      disabled={saving}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left disabled:opacity-50 ${
                        isSelected ? "bg-[var(--gold)]/10 border border-[var(--gold)]/20" : "hover:bg-[var(--surface)]"
                      }`}
                    >
                      <Avatar name={a.nome} faixa={a.faixa} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate flex items-center gap-1.5">
                          {a.nome}
                          {isSelected && <span className="text-[10px] text-[var(--gold)] font-bold">(atual)</span>}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)]">{a.faixa} · {'★'.repeat(a.grau + 1)}</div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
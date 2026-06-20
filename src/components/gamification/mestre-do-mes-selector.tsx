"use client"

import { useState, useEffect } from "react"
import { CrownIcon, SearchIcon, XIcon } from "@/components/ui/icons"
import { Avatar } from "@/components/ui/avatar"
import { toast } from "sonner"

type Aluno = {
  id: string
  nome: string
  faixa: string
  grau: number
}

type MestreData = {
  nome: string
  faixa: string
  avatar: string | null
  totalAulas: number
  mes: number
  ano: number
} | null

export function MestreDoMesSelector() {
  const [mestre, setMestre] = useState<MestreData>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/mestredomes/meu")
      .then((r) => r.json())
      .then((d) => { setMestre(d.mestre); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function openSelector() {
    setOpen(true)
    setSearch("")
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
        body: JSON.stringify({ alunoId }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMestre(data.mestre)
      setOpen(false)
      toast.success("Aluno do Mês atualizado!")
    } catch {
      toast.error("Erro ao selecionar aluno")
    } finally {
      setSaving(false)
    }
  }

  const filtered = alunos.filter((a) =>
    a.nome.toLowerCase().includes(search.toLowerCase())
  )

  const nomeMes = mestre
    ? Array.from({ length: 12 }, (_, i) => {
        const nomes = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
        return nomes[i]
      })[mestre.mes - 1]
    : ""

  if (loading) return null

  return (
    <>
      <div className="glass-card p-5 text-center relative overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 bg-[var(--gold)]/5 rounded-full blur-3xl" />
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-[var(--gold)]/10 flex items-center justify-center mx-auto mb-2">
            <CrownIcon className="w-6 h-6 text-[var(--gold)]" />
          </div>
          <h3 className="font-bold text-base">Aluno do Mês</h3>
          {mestre ? (
            <>
              <p className="text-2xl font-extrabold text-[var(--gold)] mt-2">{mestre.nome}</p>
              <p className="text-xs text-[var(--text-secondary)]">{mestre.faixa} · {nomeMes} de {mestre.ano}</p>
            </>
          ) : (
            <p className="text-sm text-[var(--text-secondary)] mt-2">Nenhum aluno selecionado este mês</p>
          )}
          <button
            onClick={openSelector}
            disabled={saving}
            className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20 hover:bg-[var(--gold)]/20 transition-all active:scale-[0.98]"
          >
            {mestre ? "Alterar Aluno do Mês" : "Escolher Aluno do Mês"}
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
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--surface)] transition-colors">
                <XIcon className="w-4 h-4" />
              </button>
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
                <p className="text-sm text-[var(--text-secondary)] text-center py-8">Nenhum aluno encontrado</p>
              ) : (
                filtered.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => selectAluno(a.id)}
                    disabled={saving}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface)] transition-all text-left disabled:opacity-50"
                  >
                    <Avatar name={a.nome} faixa={a.faixa} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{a.nome}</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">{a.faixa} · {'★'.repeat(a.grau + 1)}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { BackButton } from "@/components/ui/back-button"

interface Competicao {
  id: string
  nome: string
  data: string
  local: string | null
  faixa: string | null
  categoria: string | null
  participacoes: {
    id: string
    posicao: string | null
    aluno: { id: string; nome: string; faixa: string; avatar: string | null }
  }[]
}

interface Aluno { id: string; nome: string; faixa: string }

const medalhas = { ouro: "🥇", prata: "🥈", bronze: "🥉", participou: "🏅" }

export default function ProfessorCompeticoesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [competicoes, setCompeticoes] = useState<Competicao[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (session && session.user.role === "aluno") router.push("/dashboard/aluno")
  }, [session, status, router])

  useEffect(() => {
    if (!session) return
    Promise.all([
      fetch("/api/competicoes").then((r) => r.json()),
      fetch("/api/academia/alunos").then((r) => r.json()),
    ]).then(([c, a]) => { setCompeticoes(c); setAlunos(a.alunos || a || []); setLoading(false) })
  }, [session])

  async function criarCompeticao(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const res = await fetch("/api/competicoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: fd.get("nome"), data: fd.get("data"), local: fd.get("local"), faixa: fd.get("faixa"), categoria: fd.get("categoria") }),
    })
    if (res.ok) { const data = await res.json(); setCompeticoes((prev) => [data, ...prev]); setShowForm(false); (e.target as HTMLFormElement).reset() }
  }

  async function adicionarParticipacao(competicaoId: string, alunoId: string, posicao: string) {
    const res = await fetch(`/api/competicoes/${competicaoId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participacoes: [{ alunoId, posicao }] }),
    })
    if (res.ok) { const u = await res.json(); setCompeticoes((prev) => prev.map((c) => (c.id === competicaoId ? u : c))) }
  }

  if (status === "loading" || loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}><div className="belt-loading w-48 h-8 rounded" /></div>
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-5xl mx-auto px-5 py-8">
        <BackButton href="/dashboard/professor" />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight gradient-gold-text">Competições & Torneios</h1>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Registre competições e acompanhe resultados</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-gold text-sm px-5 py-2.5">{showForm ? "Cancelar" : "+ Nova Competição"}</button>
        </div>

        {showForm && (
          <form onSubmit={criarCompeticao} className="glass-card p-6 mb-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input name="nome" placeholder="Nome do torneio" required className="input-field" />
              <input name="data" type="date" required className="input-field" />
              <input name="local" placeholder="Local" className="input-field" />
              <select name="faixa" className="input-field"><option value="">Todas as faixas</option><option value="Branca">Branca</option><option value="Azul">Azul</option><option value="Roxa">Roxa</option><option value="Marrom">Marrom</option><option value="Preta">Preta</option></select>
              <select name="categoria" className="input-field"><option value="">Todas</option><option value="adulto">Adulto</option><option value="infantil">Infantil</option><option value="master">Master</option></select>
            </div>
            <button type="submit" className="btn-gold text-sm px-6 py-2.5">Salvar</button>
          </form>
        )}

        {competicoes.length === 0 ? (
          <div className="text-center py-16"><div className="text-5xl mb-4">🏆</div><h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>Nenhuma competição registrada</h2></div>
        ) : (
          <div className="space-y-4">
            {competicoes.map((comp) => (
              <div key={comp.id} className="glass-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>{comp.nome}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      <span>📅 {new Date(comp.data).toLocaleDateString("pt-BR")}</span>
                      {comp.local && <span>• 📍 {comp.local}</span>}
                    </div>
                  </div>
                </div>
                {comp.participacoes.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {comp.participacoes.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)]" style={{ background: "var(--bg-surface)" }}>
                        <span>{medalhas[p.posicao as keyof typeof medalhas] || "🥋"}</span>
                        <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>{p.aluno.nome}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Nenhum participante</p>}

                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <div className="flex flex-wrap gap-1.5">
                    {alunos.filter((a) => !comp.participacoes.find((p) => p.aluno.id === a.id)).slice(0, 6).map((aluno) => (
                      <div key={aluno.id} className="flex gap-1">
                        {(["ouro", "prata", "bronze", "participou"] as const).map((pos) => (
                          <button key={pos} onClick={() => adicionarParticipacao(comp.id, aluno.id, pos)} className="text-[10px] px-2 py-1 rounded border border-[var(--border)] hover:border-[var(--gold)] transition-colors" title={`${aluno.nome} - ${pos}`}>
                            {medalhas[pos]} {aluno.nome.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { PageTransition } from "@/components/ui/page-transition"
import { getBeltEmoji } from "@/lib/utils"

type Aluno = { id: string; nome: string; faixa: string; grau: number }

const beltList = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]

const beltDot: Record<string, string> = {
  Branca: "bg-white border-gray-500",
  Azul: "bg-blue-600 border-blue-400",
  Roxa: "bg-purple-600 border-purple-400",
  Marrom: "bg-amber-800 border-amber-600",
  Preta: "bg-gray-900 border-gray-600",
}

export function AlunosClient({ alunos: initial }: { alunos: Aluno[] }) {
  const [alunos, setAlunos] = useState(initial)
  const [showPromote, setShowPromote] = useState<string | null>(null)
  const [promovendo, setPromovendo] = useState<string | null>(null)
  const [busca, setBusca] = useState("")
  const [filtroFaixa, setFiltroFaixa] = useState<string>("todas")

  async function promover(alunoId: string, novaFaixa: string, novoGrau: number) {
    await fetch("/api/promocao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alunoId, novaFaixa, novoGrau }),
    })
    setPromovendo(null)
    setShowPromote(null)
    setAlunos((prev) => prev.map((a) => a.id === alunoId ? { ...a, faixa: novaFaixa, grau: novoGrau } : a))
  }

  const faixasDisponiveis = (faixaAtual: string) => {
    const idx = beltList.indexOf(faixaAtual)
    return beltList.slice(idx)
  }

  const filtrados = alunos.filter((a) => {
    const matchNome = a.nome.toLowerCase().includes(busca.toLowerCase())
    const matchFaixa = filtroFaixa === "todas" || a.faixa === filtroFaixa
    return matchNome && matchFaixa
  })

  const faixaCounts = beltList.map(f => ({ name: f, count: alunos.filter(a => a.faixa === f).length }))

  return (
    <DashboardShell role="professor">
      <PageTransition>
        <div className="space-y-5">
          {/* Header */}
          <div className="glass-card-gold p-5">
            <h2 className="text-lg font-extrabold tracking-tight">👥 Meus Alunos</h2>
            <p className="text-xs text-[var(--white-muted)] mt-1"><AnimatedCounter value={alunos.length} /> alunos vinculados</p>
          </div>

          {/* Filters */}
          <div className="glass-card p-4">
            <input className="input-premium text-sm mb-3" placeholder="Buscar aluno por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              <button onClick={() => setFiltroFaixa("todas")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all ${filtroFaixa === "todas" ? "bg-[var(--gold)] text-black" : "bg-[var(--dark-border)] text-[var(--white-muted)]"}`}>
                Todas
              </button>
              {faixaCounts.map((f) => (
                <button key={f.name} onClick={() => setFiltroFaixa(f.name)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all ${filtroFaixa === f.name ? "bg-[var(--gold)] text-black" : "bg-[var(--dark-border)] text-[var(--white-muted)]"}`}>
                  {getBeltEmoji(f.name)} {f.name} {f.count > 0 && <span className="ml-1 opacity-60">{f.count}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="glass-card p-5">
            {filtrados.length === 0 ? (
              <div className="empty-premium">
                <div className="empty-premium-icon">👥</div>
                <div className="empty-premium-title">Nenhum aluno encontrado</div>
                <div className="empty-premium-desc">Tente alterar o filtro ou a busca.</div>
              </div>
            ) : (
              <div className="grid-modern">
                {filtrados.map((a) => (
                  <div key={a.id} className="glass-card p-4 text-center hover-lift">
                    <Avatar name={a.nome} faixa={a.faixa} size={44} />
                    <div className="text-sm font-semibold mt-2 truncate">{a.nome}</div>
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${beltDot[a.faixa] || "bg-gray-500"}`} />
                      <span className="text-[11px] text-[var(--white-muted)]">{a.faixa} · {a.grau + 1}º Grau</span>
                    </div>
                    <div className="flex gap-2 mt-3 justify-center">
                      <button onClick={() => { setShowPromote(a.id); setPromovendo(`${a.id}|${a.faixa}|${a.grau}`) }} className="btn-gold px-3 py-1.5 text-[10px]">Promover</button>
                      <WhatsAppButton acao="promocao" alunoId={a.id} alunoNome={a.nome} size="sm" variant="emerald" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Promote Modal */}
          {showPromote && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowPromote(null)}>
              <div className="glass-card p-6 w-80 mx-4" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-sm mb-4">Promover Aluno</h3>
                <select className="input-premium text-sm mb-3"
                  value={promovendo?.split("|")[1] || ""}
                  onChange={(e) => setPromovendo(`${showPromote}|${e.target.value}|${0}`)}>
                  {faixasDisponiveis(alunos.find(a => a.id === showPromote)?.faixa || "").map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => {
                    const parts = (promovendo || `${showPromote}|${alunos.find(a => a.id === showPromote)?.faixa}|${0}`).split("|")
                    const aluno = alunos.find(a => a.id === showPromote)
                    if (!aluno) return
                    const novaFaixa = parts[1]
                    const novoGrau = aluno.faixa !== novaFaixa ? 0 : Math.min(aluno.grau + 1, 4)
                    promover(showPromote, novaFaixa, novoGrau)
                  }} className="flex-1 py-2.5 rounded-xl btn-gold text-xs font-bold">Confirmar</button>
                  <button onClick={() => setShowPromote(null)} className="flex-1 py-2.5 rounded-xl bg-[var(--dark-border)] text-[var(--white-muted)] text-xs font-bold">Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

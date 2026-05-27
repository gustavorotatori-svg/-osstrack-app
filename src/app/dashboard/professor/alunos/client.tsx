"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { getBeltEmoji } from "@/lib/utils"

type Aluno = { id: string; nome: string; faixa: string; grau: number }

const beltList = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]

export function AlunosClient({ alunos: initial }: { alunos: Aluno[] }) {
  const [alunos, setAlunos] = useState(initial)
  const [showPromote, setShowPromote] = useState<string | null>(null)
  const [promovendo, setPromovendo] = useState<string | null>(null)
  const [busca, setBusca] = useState("")

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

  const filtrados = alunos.filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase()))

  return (
    <DashboardShell role="professor">
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5">
          <h2 className="font-bold text-lg mb-1">👥 Meus Alunos</h2>
          <p className="text-xs text-[var(--white-muted)] mb-4">{alunos.length} alunos vinculados</p>

          <input className="input-premium text-sm mb-4" placeholder="Buscar aluno..." value={busca} onChange={(e) => setBusca(e.target.value)} />

          {filtrados.length === 0 ? (
            <p className="text-sm text-[var(--white-muted)] text-center py-8">Nenhum aluno encontrado</p>
          ) : (
            <div className="space-y-1">
              {filtrados.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[var(--dark-border)]/30 transition-all">
                  <Avatar name={a.nome} faixa={a.faixa} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{a.nome}</div>
                    <div className="text-[11px] text-[var(--white-muted)]">{getBeltEmoji(a.faixa)} {a.faixa} · {a.grau + 1}º Grau</div>
                  </div>
                  {showPromote === a.id ? (
                    <div className="flex gap-1.5 shrink-0">
                      <select className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg text-[10px] px-1 py-1 text-white"
                        value={promovendo?.split("|")[1] || a.faixa}
                        onChange={(e) => setPromovendo(`${a.id}|${e.target.value}|${a.grau}`)}>
                        {faixasDisponiveis(a.faixa).map((f) => (<option key={f} value={f}>{f}</option>))}
                      </select>
                      <button onClick={() => {
                        const parts = (promovendo || `${a.id}|${a.faixa}|${a.grau}`).split("|")
                        promover(a.id, parts[1], a.faixa !== parts[1] ? 0 : Math.min(a.grau + 1, 4))
                      }} className="w-8 h-8 rounded-xl gradient-gold text-black flex items-center justify-center text-xs font-bold">✓</button>
                      <button onClick={() => setShowPromote(null)} className="w-8 h-8 rounded-xl bg-[var(--dark-border)] text-[var(--white-muted)] flex items-center justify-center text-xs">✗</button>
                    </div>
                  ) : (
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => { setShowPromote(a.id); setPromovendo(`${a.id}|${a.faixa}|${a.grau}`) }} className="btn-gold px-3 py-1.5 text-[10px]">Promover</button>
                      <WhatsAppButton acao="promocao" alunoId={a.id} alunoNome={a.nome} size="sm" variant="emerald" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}

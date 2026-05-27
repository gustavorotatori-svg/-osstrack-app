"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { PageTransition } from "@/components/ui/page-transition"
import { Celebration } from "@/components/ui/celebration"
import { getBeltEmoji } from "@/lib/utils"

type Aluno = { id: string; nome: string; faixa: string; grau: number }

const beltList = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]

export function AlunosClient({ alunos: initial }: { alunos: Aluno[] }) {
  const [alunos, setAlunos] = useState(initial)
  const [showPromote, setShowPromote] = useState<string | null>(null)
  const [promovendo, setPromovendo] = useState<string | null>(null)
  const [promovendoAgora, setPromovendoAgora] = useState(false)
  const [busca, setBusca] = useState("")
  const [filtroFaixa, setFiltroFaixa] = useState<string>("todas")
  const [celebrate, setCelebrate] = useState<{ show: boolean; title: string }>({ show: false, title: "" })

  async function promover(alunoId: string, novaFaixa: string, novoGrau: number) {
    setPromovendoAgora(true)
    const prev = alunos
    setAlunos((a) => a.map((x) => x.id === alunoId ? { ...x, faixa: novaFaixa, grau: novoGrau } : x))
    try {
      const res = await fetch("/api/promocao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alunoId, novaFaixa, novoGrau }),
      })
      if (!res.ok) throw new Error()
      const nome = prev.find(a => a.id === alunoId)?.nome || "Aluno"
      setCelebrate({ show: true, title: `${nome} agora é ${novaFaixa}!` })
      toast.success(`🎉 ${nome} promovido a ${novaFaixa} ${novoGrau + 1}º Grau!`)
    } catch {
      setAlunos(prev)
      toast.error("Erro ao promover. Tente novamente.")
    } finally {
      setPromovendoAgora(false)
      setPromovendo(null)
      setShowPromote(null)
    }
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
      <Celebration show={celebrate.show} title={celebrate.title} onDone={() => setCelebrate({ show: false, title: "" })} />
      <PageTransition>
        <div className="space-y-5">
          <div className="glass-card-gold p-5">
            <h2 className="text-lg font-extrabold tracking-tight">👥 Meus Alunos</h2>
            <p className="text-xs text-[var(--white-muted)] mt-1"><AnimatedCounter value={alunos.length} /> alunos vinculados</p>
          </div>

          <div className="glass-card p-4">
            <input className="input-premium text-sm mb-3" placeholder="Buscar aluno por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              <button onClick={() => setFiltroFaixa("todas")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all active:scale-95 ${filtroFaixa === "todas" ? "bg-[var(--gold)] text-black" : "bg-[var(--dark-border)] text-[var(--white-muted)]"}`}>
                Todas
              </button>
              {faixaCounts.map((f) => (
                <button key={f.name} onClick={() => setFiltroFaixa(f.name)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all active:scale-95 ${filtroFaixa === f.name ? "bg-[var(--gold)] text-black" : "bg-[var(--dark-border)] text-[var(--white-muted)]"}`}>
                  {getBeltEmoji(f.name)} {f.name} {f.count > 0 && <span className="ml-1 opacity-60">{f.count}</span>}
                </button>
              ))}
            </div>
          </div>

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
                    <div className="text-[11px] text-[var(--white-muted)] mt-0.5">{getBeltEmoji(a.faixa)} {a.faixa} · {a.grau + 1}º Grau</div>
                    <div className="flex gap-2 mt-3 justify-center">
                      <button onClick={() => { setShowPromote(a.id); setPromovendo(`${a.id}|${a.faixa}|${a.grau}`) }} className="btn-gold px-3 py-1.5 text-[10px] active:scale-90">Promover</button>
                      <WhatsAppButton acao="promocao" alunoId={a.id} alunoNome={a.nome} size="sm" variant="emerald" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showPromote && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowPromote(null)}>
              <div className="glass-card p-6 w-80 mx-4" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-sm mb-4">🎉 Promover Aluno</h3>
                <p className="text-xs text-[var(--white-muted)] mb-4">Selecione a nova faixa:</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {faixasDisponiveis(alunos.find(a => a.id === showPromote)?.faixa || "").map((f) => {
                    const selected = promovendo?.split("|")[1] === f
                    return (
                      <button key={f} onClick={() => setPromovendo(`${showPromote}|${f}|${0}`)}
                        className={`px-4 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${selected ? "gradient-gold text-black" : "bg-[var(--dark-border)] text-[var(--white-muted)] hover:text-white"}`}>
                        {getBeltEmoji(f)} {f}
                      </button>
                    )
                  })}
                </div>
                <button onClick={() => {
                  const parts = (promovendo || `${showPromote}|${alunos.find(a => a.id === showPromote)?.faixa}|${0}`).split("|")
                  const aluno = alunos.find(a => a.id === showPromote)
                  if (!aluno) return
                  const novaFaixa = parts[1]
                  const novoGrau = aluno.faixa !== novaFaixa ? 0 : Math.min(aluno.grau + 1, 4)
                  promover(showPromote, novaFaixa, novoGrau)
                }} disabled={promovendoAgora}
                  className="w-full py-3 rounded-xl btn-gold text-xs font-bold disabled:opacity-50 active:scale-[0.98]">
                  {promovendoAgora ? "⏳ Promovendo..." : "✓ Confirmar Promoção"}
                </button>
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

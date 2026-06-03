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
import { useT } from "@/lib/use-t"

type Aluno = { id: string; nome: string; faixa: string; grau: number }

const beltList = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]
const beltOrder: Record<string, number> = { Branca: 0, Azul: 1, Roxa: 2, Marrom: 3, Preta: 4 }

type SortMode = "nome" | "faixa" | "grau"

export function AlunosClient({ alunos: initial }: { alunos: Aluno[] }) {
  const t = useT("professor.alunos")
  const [alunos, setAlunos] = useState(initial)
  const [showPromote, setShowPromote] = useState<string | null>(null)
  const [promovendo, setPromovendo] = useState<string | null>(null)
  const [promovendoAgora, setPromovendoAgora] = useState(false)
  const [busca, setBusca] = useState("")
  const [filtroFaixa, setFiltroFaixa] = useState<string>("todas")
  const [sort, setSort] = useState<SortMode>("nome")
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
      setCelebrate({ show: true, title: `${nome} ${t("promovido")} ${novaFaixa}!` })
      toast.success(`${nome} ${t("promovidoGrau")} ${novaFaixa} ${novoGrau + 1}º Grau!`)
    } catch {
      setAlunos(prev)
      toast.error(t("erroPromover"))
    } finally {
      setPromovendoAgora(false)
      setPromovendo(null)
      setShowPromote(null)
    }
  }

  async function convidarWhatsApp(alunoId: string, alunoNome: string) {
    try {
      const res = await fetch("/api/convites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "aluno", alunoId }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      window.open(data.whatsapp, "_blank")
      toast.success(`${t("conviteEnviado")} ${alunoNome}!`)
    } catch {
      toast.error(t("erroConvite"))
    }
  }

  const faixasDisponiveis = (faixaAtual: string) => {
    const idx = beltList.indexOf(faixaAtual)
    return beltList.slice(idx)
  }

  let filtrados = alunos.filter((a) => {
    const matchNome = a.nome.toLowerCase().includes(busca.toLowerCase())
    const matchFaixa = filtroFaixa === "todas" || a.faixa === filtroFaixa
    return matchNome && matchFaixa
  })

  if (sort === "nome") filtrados.sort((a, b) => a.nome.localeCompare(b.nome))
  else if (sort === "faixa") filtrados.sort((a, b) => beltOrder[a.faixa] - beltOrder[b.faixa])
  else if (sort === "grau") filtrados.sort((a, b) => b.grau - a.grau)

  

  return (
    <DashboardShell role="professor">
      <Celebration show={celebrate.show} title={celebrate.title} onDone={() => setCelebrate({ show: false, title: "" })} />
      <PageTransition>
        <div className="space-y-3">
          <div className="glass-card-gold">
            <h2 className="text-lg font-extrabold tracking-tight">{t("title")}</h2>
            <p className="text-xs text-[var(--white-muted)] mt-0.5"><AnimatedCounter value={alunos.length} /> {t("alunosVinculados")}</p>
          </div>

          <div className="glass-card">
            {/* Busca */}
            <input className="input-premium text-sm mb-3" placeholder={t("buscar")} value={busca} onChange={(e) => setBusca(e.target.value)} />

            {/* Filtro por faixa */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none mb-3">
              <button onClick={() => setFiltroFaixa("todas")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all active:scale-95 ${filtroFaixa === "todas" ? "bg-[var(--gold)] text-black" : "bg-[var(--dark-border)] text-[var(--white-muted)]"}`}>
                {t("todas")}
              </button>
              {beltList.map(f => (
                <button key={f} onClick={() => setFiltroFaixa(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all active:scale-95 ${filtroFaixa === f ? "bg-[var(--gold)] text-black" : "bg-[var(--dark-border)] text-[var(--white-muted)]"}`}>
                  {getBeltEmoji(f)} {f}
                </button>
              ))}
            </div>

            {/* Ordenação */}
            <div className="flex gap-2 items-center">
              <span className="text-[10px] text-[var(--gray)] font-semibold uppercase tracking-wider">{t("ordenar")}</span>
              {(["nome", "faixa", "grau"] as const).map((s) => (
                <button key={s} onClick={() => setSort(s)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-all active:scale-95 ${sort === s ? "gradient-gold text-black" : "bg-[var(--dark-border)] text-[var(--white-muted)]"}`}>
                  {s === "nome" ? "A-Z" : s === "faixa" ? <>🥋 {t("faixa")}</> : <>🎓 {t("grau")}</>}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card">
            {filtrados.length === 0 ? (
              <div className="empty-premium">
                <div className="empty-premium-icon emoji-glow">👥</div>
                <div className="empty-premium-title">{t("nenhumEncontrado")}</div>
                <div className="empty-premium-desc">{t("descEmpty")}</div>
              </div>
            ) : (
              <div className="grid-modern">
                {filtrados.map((a) => (
                  <div key={a.id} className="glass-card text-center hover-lift">
                    <Avatar name={a.nome} faixa={a.faixa} size={44} />
                    <div className="text-sm font-semibold mt-1.5 truncate">{a.nome}</div>
                    <div className="text-[11px] text-[var(--white-muted)] mt-0.5">{getBeltEmoji(a.faixa)} {a.faixa} · {a.grau + 1}º Grau</div>
                    <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
                      <button onClick={() => { setShowPromote(a.id); setPromovendo(`${a.id}|${a.faixa}|${a.grau}`) }}
                        className="btn-gold px-2.5 py-1.5 text-[10px] active:scale-90">{t("promover")}</button>
                      <button onClick={() => convidarWhatsApp(a.id, a.nome)}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-green-600/15 text-green-400 border border-green-600/25 hover:bg-green-600/25 active:scale-90">📲 {t("convidar")}</button>
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
                <h3 className="font-bold text-base mb-4">{t("promoverAluno")}</h3>
                <p className="text-sm text-[var(--white-muted)] mb-4">{t("selecioneFaixa")}</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {faixasDisponiveis(alunos.find(a => a.id === showPromote)?.faixa || "").map((f) => {
                    const selected = promovendo?.split("|")[1] === f
                    return (
                      <button key={f} onClick={() => setPromovendo(`${showPromote}|${f}|${0}`)}
                        className={`px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${selected ? "gradient-gold text-black" : "bg-[var(--dark-border)] text-[var(--white-muted)] hover:text-white"}`}>
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
                  className="w-full py-3 rounded-xl btn-gold text-sm font-bold disabled:opacity-50 active:scale-[0.98]">
                  {promovendoAgora ? <>{t("promovendo")}</> : <>{t("confirmarPromocao")}</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

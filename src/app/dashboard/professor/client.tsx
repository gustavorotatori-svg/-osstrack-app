"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { PageTransition } from "@/components/ui/page-transition"
import { Celebration } from "@/components/ui/celebration"
import { getBeltEmoji } from "@/lib/utils"

type Props = {
  professor: { nome: string; faixa: string; grau: number }
  alunos: { id: string; nome: string; faixa: string; grau: number }[]
  turmas: { id: string; nome: string; horario: string; dias: string; maxAlunos: number; totalAlunos: number }[]
  presencasHoje: { id: string; aluno: { id: string; nome: string; faixa: string }; data: string; horario: string; status: string; turma: string }[]
}

const beltList = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]

export function ProfessorDashboardClient({ professor, alunos, turmas, presencasHoje }: Props) {
  const [tab, setTab] = useState<"presencas" | "alunos" | "turmas">("presencas")
  const [promovendo, setPromovendo] = useState<string | null>(null)
  const [showPromote, setShowPromote] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [promovendoAgora, setPromovendoAgora] = useState(false)
  const [inviteLink, setInviteLink] = useState("")
  const [whatsappLink, setWhatsappLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [gerando, setGerando] = useState(false)
  const [celebrate, setCelebrate] = useState<{ show: boolean; title: string }>({ show: false, title: "" })

  async function confirmarPresenca(presencaId: string, status: string) {
    setConfirmando(presencaId)
    try {
      const res = await fetch("/api/presenca/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presencaId, status }),
      })
      if (!res.ok) throw new Error()
      toast.success(status === "confirmed" ? "Presença confirmada!" : "Presença recusada")
    } catch {
      toast.error("Erro ao confirmar presença")
    } finally {
      setConfirmando(null)
    }
  }

  async function promover(alunoId: string, novaFaixa: string, novoGrau: number) {
    setPromovendoAgora(true)
    try {
      const res = await fetch("/api/promocao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alunoId, novaFaixa, novoGrau }),
      })
      if (!res.ok) throw new Error()
      const nome = alunos.find(a => a.id === alunoId)?.nome || "Aluno"
      setCelebrate({ show: true, title: `${nome} promovido a ${novaFaixa}!` })
      toast.success(`${nome} agora é ${novaFaixa} ${novoGrau + 1}º Grau!`)
    } catch {
      toast.error("Erro ao promover aluno")
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

  const confirmed = presencasHoje.filter(p => p.status === "confirmed").length
  const pending = presencasHoje.filter(p => p.status === "pending").length

  return (
    <DashboardShell role="professor">
      <Celebration show={celebrate.show} title={celebrate.title} onDone={() => setCelebrate({ show: false, title: "" })} />
      <PageTransition>
        <div className="space-y-3">
          {/* Hero */}
            <div className="glass-card-gold text-center relative overflow-hidden">
            <div className="absolute top-[-40px] right-[-40px] w-32 h-32 bg-[var(--gold)]/5 rounded-full blur-3xl" />
            <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center text-2xl font-extrabold text-black mx-auto mb-3 shadow-lg">
              {professor.nome.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Prof. {professor.nome}</h2>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold mt-2.5 belt-black">
              ⬛ {professor.faixa} · {professor.grau}º Grau
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 enter-stagger">
            <div className="stat-card">
              <div className="text-xl mb-1 emoji-glow">👥</div>
              <div className="text-3xl font-extrabold text-[var(--gold)]"><AnimatedCounter value={alunos.length} /></div>
              <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">Alunos</div>
            </div>
            <div className="stat-card">
              <div className="text-xl mb-1 emoji-check">✅</div>
              <div className="text-3xl font-extrabold text-emerald-500"><AnimatedCounter value={confirmed} /></div>
              <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">Presentes</div>
            </div>
            <div className="stat-card">
              <div className="text-xl mb-1">⏳</div>
              <div className="text-3xl font-extrabold text-yellow-500"><AnimatedCounter value={pending} /></div>
              <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">Pendentes</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tab-bar">
            <button className={`tab-btn ${tab === "presencas" ? "active" : ""}`} onClick={() => setTab("presencas")}>
              📋 Presenças
            </button>
            <button className={`tab-btn ${tab === "alunos" ? "active" : ""}`} onClick={() => setTab("alunos")}>
              👥 Alunos {alunos.length > 0 && <span className="ml-1 text-[10px] opacity-60">{alunos.length}</span>}
            </button>
            <button className={`tab-btn ${tab === "turmas" ? "active" : ""}`} onClick={() => setTab("turmas")}>
              📅 Turmas {turmas.length > 0 && <span className="ml-1 text-[10px] opacity-60">{turmas.length}</span>}
            </button>
          </div>

          {/* Tab: Presenças */}
          {tab === "presencas" && (
            <div className="glass-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base tracking-tight">📋 Presenças de Hoje</h3>
                <span className="tag-premium">{presencasHoje.length} registros</span>
              </div>
              {presencasHoje.length === 0 ? (
                <div className="empty-premium">
                  <div className="empty-premium-icon emoji-glow">🥋</div>
                  <div className="empty-premium-title">Nenhum check-in hoje</div>
                  <div className="empty-premium-desc">Os alunos ainda não fizeram check-in. Quando alguém chegar, aparecerá aqui.</div>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {presencasHoje.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[var(--dark-border)]/30 transition-all">
                      <Avatar name={p.aluno.nome} faixa={p.aluno.faixa} size={40} />
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold truncate">{p.aluno.nome}</div>
                        <div className="flex items-center gap-2 text-xs text-[var(--white-muted)]">
                          <span>{p.aluno.faixa}</span>
                          <span className="w-1 h-1 rounded-full bg-[var(--dark-border)]" />
                          <span>{p.turma || "Treino"}</span>
                          <span className="w-1 h-1 rounded-full bg-[var(--dark-border)]" />
                          <span>{p.horario}</span>
                        </div>
                      </div>
                      {p.status === "confirmed" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="glow-dot green" /> Presente
                        </span>
                      ) : (
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => confirmarPresenca(p.id, "confirmed")} disabled={confirmando === p.id}
                            className="w-10 h-10 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white flex items-center justify-center text-base font-bold transition-all border border-emerald-600/30 active:scale-90 disabled:opacity-50">
                            {confirmando === p.id ? "⏳" : "✓"}
                          </button>
                          <button onClick={() => confirmarPresenca(p.id, "rejected")} disabled={confirmando === p.id}
                            className="w-10 h-10 rounded-xl bg-red-700/20 hover:bg-red-700 text-red-400 hover:text-white flex items-center justify-center text-base font-bold transition-all border border-red-700/30 active:scale-90 disabled:opacity-50">
                            ✗
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Alunos */}
          {tab === "alunos" && (
            <div className="glass-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base tracking-tight">👥 Meus Alunos</h3>
                <span className="tag-premium">{alunos.length} vinculados</span>
              </div>
              {alunos.length === 0 ? (
                <div className="empty-premium">
                  <div className="empty-premium-icon emoji-glow">👥</div>
                  <div className="empty-premium-title">Nenhum aluno ainda</div>
                  <div className="empty-premium-desc">Compartilhe seu link de convite para começar a vincular alunos.</div>
                </div>
              ) : (
                <div className="grid-modern">
                  {alunos.map((a) => (
                    <div key={a.id} className="glass-card text-center hover-lift">
                      <Avatar name={a.nome} faixa={a.faixa} size={48} />
                      <div className="text-base font-semibold mt-2 truncate">{a.nome}</div>
                      <div className="text-xs text-[var(--white-muted)] mt-0.5">{getBeltEmoji(a.faixa)} {a.faixa} · {a.grau + 1}º Grau</div>
                      <div className="flex gap-2 mt-3 justify-center">
                        <button onClick={() => { setShowPromote(a.id); setPromovendo(`${a.id}|${a.faixa}|${a.grau}`) }} className="btn-gold px-3 py-1.5 text-xs active:scale-90">
                          Promover
                        </button>
                        <WhatsAppButton acao="promocao" alunoId={a.id} alunoNome={a.nome} size="sm" variant="emerald" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showPromote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowPromote(null)}>
                  <div className="glass-card p-6 w-80 mx-4" onClick={e => e.stopPropagation()}>
                    <h3 className="font-bold text-base mb-4">🎉 Promover Aluno</h3>
                    <p className="text-sm text-[var(--white-muted)] mb-4">Selecione a nova faixa:</p>
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
                      {promovendoAgora ? "⏳ Promovendo..." : "✓ Confirmar Promoção"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Turmas */}
          {tab === "turmas" && (
            <div className="glass-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base tracking-tight">📅 Minhas Turmas</h3>
                <span className="tag-premium">{turmas.length} turmas</span>
              </div>
              {turmas.length === 0 ? (
                <div className="empty-premium">
                  <div className="empty-premium-icon emoji-glow">📅</div>
                  <div className="empty-premium-title">Nenhuma turma criada</div>
                  <div className="empty-premium-desc">Crie turmas na agenda para organizar seus horários de aula.</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {turmas.map((t) => (
                    <div key={t.id} className="glass-card compact flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-base">{t.nome}</h4>
                        <div className="flex items-center gap-3 text-sm text-[var(--white-muted)] mt-0.5">
                          <span>🕐 {t.horario}</span>
                          <span>📅 {t.dias}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="progress-gold w-20">
                          <div className="progress-gold-fill" style={{ width: `${(t.totalAlunos / t.maxAlunos) * 100}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-[var(--white-muted)]">{t.totalAlunos}/{t.maxAlunos}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Convite — centralizado */}
          <div className="glass-card text-center">
            <h3 className="font-bold text-base tracking-tight mb-1">📲 Convidar Alunos</h3>
            <p className="text-sm text-[var(--white-muted)] mb-4 max-w-md mx-auto">Gere um link para compartilhar com novos alunos:</p>
            <div className="flex gap-2 max-w-md mx-auto mb-3">
              <input type="text" value={gerando ? "Gerando..." : inviteLink || "osstrack.app"} readOnly className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-[var(--dark-border)] text-white text-base text-center" />
              <button type="button" disabled={gerando} onClick={async () => {
                setGerando(true)
                try {
                  const res = await fetch("/api/convites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipo: "aluno" }) })
                  if (!res.ok) throw new Error()
                  const d = await res.json()
                  setInviteLink(d.link)
                  setWhatsappLink(d.whatsapp)
                  toast.success("Link gerado com sucesso!")
                } catch { toast.error("Erro ao gerar link") }
                finally { setGerando(false) }
              }} className="px-6 py-3 rounded-xl font-semibold text-sm btn-gold disabled:opacity-50 active:scale-[0.97] shrink-0">
                {gerando ? "⏳" : "Gerar"}
              </button>
            </div>
            {inviteLink && (
              <div className="flex gap-3 justify-center max-w-sm mx-auto">
                <button type="button" onClick={() => { navigator.clipboard.writeText(inviteLink); setCopied(true); toast.success("Link copiado!"); setTimeout(() => setCopied(false), 2000) }}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold border border-[var(--dark-border)] hover:border-[var(--gold)] transition-all active:scale-[0.97] max-w-[160px]">
                  {copied ? "✅ Copiado!" : "📋 Copiar"}
                </button>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-center bg-green-600/15 text-green-400 border border-green-600/25 hover:bg-green-600/25 transition-all active:scale-[0.97] max-w-[160px]">
                  📲 WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

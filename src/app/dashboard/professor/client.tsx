"use client"

import { useState } from "react"
import { Building2, Search, Clock, X } from "lucide-react"
import { toast } from "sonner"
import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { PageTransition } from "@/components/ui/page-transition"
import { Celebration } from "@/components/ui/celebration"
import { ConviteSection } from "@/components/convites/convite-section"
import { UsersIcon, CheckIcon, TimerIcon, ClipboardIcon, CalendarIcon, AwardIcon, GraduationIcon, UserPlusIcon, DumbbellIcon } from "@/components/ui/icons"
import { getBeltEmoji } from "@/lib/utils"
import { useT } from "@/lib/use-t"

function ProfessorAcademiaSection() {
  const t = useT("professor.dashboard")
  const [tab, setTab] = useState<"convidar" | "buscar">("convidar")
  const [busca, setBusca] = useState("")
  const [resultados, setResultados] = useState<{ id: string; nome: string; cidade: string; estado: string }[]>([])
  const [buscando, setBuscando] = useState(false)
  const [solicitando, setSolicitando] = useState<string | null>(null)

  async function buscarAcademias(q: string) {
    setBusca(q)
    if (q.length < 2) { setResultados([]); return }
    setBuscando(true)
    try {
      const res = await fetch(`/api/academias?q=${encodeURIComponent(q)}`)
      if (res.ok) setResultados(await res.json())
    } catch { /* ignore */ }
    setBuscando(false)
  }

  async function solicitarVinculo(academiaId: string) {
    setSolicitando(academiaId)
    try {
      const res = await fetch("/api/professores/solicitar-vinculo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academiaId }),
      })
      if (res.ok) {
        toast.success(t("solicitacaoEnviada"))
        setResultados([])
        setBusca("")
      } else {
        const data = await res.json()
        toast.error(data.error || t("erroSolicitar"))
      }
    } catch {
      toast.error(t("erroConexao"))
    }
    setSolicitando(null)
  }

  return (
    <div className="surface p-5">
      <div className="text-center mb-4">
        <Building2 className="w-8 h-8 mx-auto mb-2 text-[var(--gold)]" />
        <h3 className="font-bold text-base">{t("vincularAcademia")}</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1">{t("semVinculo")}</p>
      </div>
      <div className="flex gap-1 bg-[var(--border)] rounded-lg p-1 mb-4">
        <button onClick={() => setTab("convidar")}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1 ${tab === "convidar" ? "bg-[var(--gold)] text-black" : "text-[var(--text-secondary)]"}`}>
          <UserPlusIcon className="w-3.5 h-3.5" /> {t("convidar")}
        </button>
        <button onClick={() => setTab("buscar")}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1 ${tab === "buscar" ? "bg-[var(--gold)] text-black" : "text-[var(--text-secondary)]"}`}>
          <Search className="w-3.5 h-3.5" /> {t("buscar")}
        </button>
      </div>
      {tab === "convidar" ? (
        <div className="text-center">
          <p className="text-xs text-[var(--text-secondary)] mb-3">{t("convidarDesc")}</p>
          <ConviteSection tipo="academia" />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-secondary)]">{t("buscarDesc")}</p>
          <input type="text" className="w-full px-4 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-white text-sm outline-none focus:border-[var(--red)] transition-colors" placeholder={t("placeholderBusca")}
            value={busca} onChange={(e) => buscarAcademias(e.target.value)} />
          {buscando && <p className="text-xs text-[var(--gold)] text-center">{t("buscando")}</p>}
          {resultados.map((acad) => (
            <div key={acad.id} className="flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{acad.nome}</p>
                {acad.cidade && <p className="text-xs text-[var(--text-secondary)]">{acad.cidade}/{acad.estado}</p>}
              </div>
              <button onClick={() => solicitarVinculo(acad.id)} disabled={solicitando === acad.id}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-all active:scale-95 disabled:opacity-50">
                {solicitando === acad.id ? "..." : t("solicitar")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

type Props = {
  professor: { nome: string; faixa: string; grau: number; academiaId: string | null }
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
  const [celebrate, setCelebrate] = useState<{ show: boolean; title: string }>({ show: false, title: "" })
  const t = useT("professor.dashboard")

  async function confirmarPresenca(presencaId: string, status: string) {
    setConfirmando(presencaId)
    try {
      const res = await fetch("/api/presenca/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presencaId, status }),
      })
      if (!res.ok) throw new Error()
      toast.success(status === "confirmed" ? t("confirmarPresenca") : t("presencaRecusada"))
    } catch {
      toast.error(t("erroConfirmar"))
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
      setCelebrate({ show: true, title: `${nome} ${t("promovido")} ${novaFaixa}!` })
      toast.success(`${nome} ${t("promovidoGrau")} ${novaFaixa} ${novoGrau + 1}º Grau!`)
    } catch {
      toast.error(t("erroPromover"))
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
        <div className="max-w-5xl mx-auto space-y-3">
          {/* Hero */}
            <div className="surface border border-[var(--gold-dim)] text-center p-5 relative overflow-hidden">
            <div className="absolute top-[-40px] right-[-40px] w-32 h-32 bg-[var(--gold)]/5 rounded-full blur-3xl" />
            <div className="w-16 h-16 rounded-2xl bg-[var(--gold)] flex items-center justify-center text-2xl font-extrabold text-black mx-auto mb-3 shadow-lg">
              {professor.nome.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Prof. {professor.nome}</h2>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold mt-2.5 belt-black">
              <GraduationIcon className="w-3.5 h-3.5" /> {professor.faixa} · {professor.grau}º Grau
            </span>
          </div>

          {/* Vinculo academia */}
          {!professor.academiaId && <ProfessorAcademiaSection />}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 enter-stagger">
            <div className="text-center">
              <UsersIcon className="w-6 h-6 mb-1 mx-auto text-[var(--gold)]" />
              <div className="text-3xl font-extrabold text-[var(--gold)]"><AnimatedCounter value={alunos.length} /></div>
              <div className="text-[10px] text-[var(--text-secondary)] mt-1 uppercase tracking-wide">{t("alunos")}</div>
            </div>
            <div className="text-center">
              <CheckIcon className="w-6 h-6 mb-1 mx-auto text-emerald-500" />
              <div className="text-3xl font-extrabold text-emerald-500"><AnimatedCounter value={confirmed} /></div>
              <div className="text-[10px] text-[var(--text-secondary)] mt-1 uppercase tracking-wide">{t("presentes")}</div>
            </div>
            <div className="text-center">
              <TimerIcon className="w-6 h-6 mb-1 mx-auto text-yellow-500" />
              <div className="text-3xl font-extrabold text-yellow-500"><AnimatedCounter value={pending} /></div>
              <div className="text-[10px] text-[var(--text-secondary)] mt-1 uppercase tracking-wide">{t("pendentes")}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tab-bar">
            <button className={`tab-btn gap-1.5 ${tab === "presencas" ? "active" : ""}`} onClick={() => setTab("presencas")}>
              <ClipboardIcon className="w-4 h-4" /> {t("presencas")}
            </button>
            <button className={`tab-btn gap-1.5 ${tab === "alunos" ? "active" : ""}`} onClick={() => setTab("alunos")}>
              <UsersIcon className="w-4 h-4" /> {t("alunos")} {alunos.length > 0 && <span className="ml-1 text-[10px] opacity-60">{alunos.length}</span>}
            </button>
            <button className={`tab-btn gap-1.5 ${tab === "turmas" ? "active" : ""}`} onClick={() => setTab("turmas")}>
              <CalendarIcon className="w-4 h-4" /> {t("turmas")} {turmas.length > 0 && <span className="ml-1 text-[10px] opacity-60">{turmas.length}</span>}
            </button>
          </div>

          {/* Tab: Presenças */}
          {tab === "presencas" && (
            <div className="surface p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base tracking-tight flex items-center gap-1.5">
                  <ClipboardIcon className="w-4 h-4 text-[var(--gold)]" /> {t("presencasHoje")}
                </h3>
                <span className="text-[10px] font-semibold text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)] px-2.5 py-1 rounded-lg">{presencasHoje.length} {t("registros")}</span>
              </div>
              {presencasHoje.length === 0 ? (
                <div className="text-center py-10">
                  <DumbbellIcon className="w-6 h-6 mb-2 mx-auto text-[var(--gold)]" />
                  <div className="text-sm font-semibold">{t("nenhumCheckin")}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">{t("descEmptyCheckin")}</div>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {presencasHoje.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[var(--border)]/30 transition-all">
                      <Avatar name={p.aluno.nome} faixa={p.aluno.faixa} size={40} />
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold truncate">{p.aluno.nome}</div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                          <span>{p.aluno.faixa}</span>
                          <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                          <span>{p.turma || "Treino"}</span>
                          <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                          <span>{p.horario}</span>
                        </div>
                      </div>
                      {p.status === "confirmed" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="glow-dot green" /> {t("presente")}
                        </span>
                      ) : (
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => confirmarPresenca(p.id, "confirmed")} disabled={confirmando === p.id}
                            className="w-10 h-10 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white flex items-center justify-center text-base font-bold transition-all border border-emerald-600/30 active:scale-90 disabled:opacity-50">
                            {confirmando === p.id ? <TimerIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                          </button>
                          <button onClick={() => confirmarPresenca(p.id, "rejected")} disabled={confirmando === p.id}
                            className="w-10 h-10 rounded-xl bg-red-700/20 hover:bg-red-700 text-red-400 hover:text-white flex items-center justify-center text-base font-bold transition-all border border-red-700/30 active:scale-90 disabled:opacity-50">
                            <X className="w-4 h-4" />
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
            <div className="surface p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base tracking-tight flex items-center gap-1.5">
                  <UsersIcon className="w-4 h-4 text-[var(--gold)]" /> {t("meusAlunos")}
                </h3>
                <span className="text-[10px] font-semibold text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)] px-2.5 py-1 rounded-lg">{alunos.length} {t("vinculados")}</span>
              </div>
              {alunos.length === 0 ? (
                <div className="text-center py-10">
                  <UsersIcon className="w-6 h-6 mb-2 mx-auto text-[var(--gold)]" />
                  <div className="text-sm font-semibold">{t("nenhumAluno")}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">{t("descEmptyAlunos")}</div>
                </div>
              ) : (
                <div className="grid-modern">
                  {alunos.map((a) => (
                    <div key={a.id} className="surface text-center p-4">
                      <Avatar name={a.nome} faixa={a.faixa} size={48} />
                      <div className="text-base font-semibold mt-2 truncate">{a.nome}</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">{getBeltEmoji(a.faixa)} {a.faixa} · {a.grau + 1}º Grau</div>
                      <div className="flex gap-2 mt-3 justify-center">
                        <button onClick={() => { setShowPromote(a.id); setPromovendo(`${a.id}|${a.faixa}|${a.grau}`) }} className="btn btn-primary px-3 py-1.5 text-xs active:scale-90 gap-1">
                          <AwardIcon className="w-3.5 h-3.5" /> {t("promover")}
                        </button>
                        <WhatsAppButton acao="promocao" alunoId={a.id} alunoNome={a.nome} size="sm" variant="emerald" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showPromote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowPromote(null)}>
                  <div className="surface p-6 w-80 mx-4" onClick={e => e.stopPropagation()}>
                    <h3 className="font-bold text-base mb-4 flex items-center gap-1.5">
                      <AwardIcon className="w-4 h-4 text-[var(--gold)]" /> {t("promoverAluno")}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">{t("selecioneFaixa")}</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {faixasDisponiveis(alunos.find(a => a.id === showPromote)?.faixa || "").map((f) => {
                        const selected = promovendo?.split("|")[1] === f
                        return (
                          <button key={f} onClick={() => setPromovendo(`${showPromote}|${f}|${0}`)}
                            className={`px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${selected ? "bg-[var(--gold)] text-black" : "bg-[var(--border)] text-[var(--text-secondary)] hover:text-white"}`}>
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
                      className="w-full py-3 rounded-xl btn btn-primary text-sm font-bold disabled:opacity-50 active:scale-[0.98] gap-1.5">
                      {promovendoAgora ? <TimerIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                      {promovendoAgora ? t("promovendo") : t("confirmarPromocao")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Turmas */}
          {tab === "turmas" && (
            <div className="surface p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base tracking-tight flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-[var(--gold)]" /> {t("minhasTurmas")}
                </h3>
                <span className="text-[10px] font-semibold text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)] px-2.5 py-1 rounded-lg">{turmas.length} {t("turmasCount")}</span>
              </div>
              {turmas.length === 0 ? (
                <div className="text-center py-10">
                  <CalendarIcon className="w-6 h-6 mb-2 mx-auto text-[var(--gold)]" />
                  <div className="text-sm font-semibold">{t("nenhumaTurma")}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">{t("descEmptyTurmas")}</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {turmas.map((t) => (
                    <div key={t.id} className="surface p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-base">{t.nome}</h4>
                        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {t.horario}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3.5 h-3.5" /> {t.dias}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="progress w-20">
                          <div className="progress-fill-gold" style={{ width: `${(t.totalAlunos / t.maxAlunos) * 100}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-[var(--text-secondary)]">{t.totalAlunos}/{t.maxAlunos}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Link para gerenciar turmas (inclui vincular alunos) */}
          <ConviteSection tipo="aluno" />
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

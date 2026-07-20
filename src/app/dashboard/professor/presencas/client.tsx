"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { PageTransition } from "@/components/ui/page-transition"
import { motion, AnimatePresence } from "framer-motion"
import { useT } from "@/lib/use-t"
import { Search, Check, X, Plus } from "lucide-react"

type Presenca = {
  id: string
  aluno: { id: string; nome: string; faixa: string }
  data: string
  horario: string
  status: string
  turma: string
}

export function PresencasClient({
  presencasHoje: initial,
  role = "professor",
  todosAlunos = [],
}: {
  presencasHoje: Presenca[]
  role?: string
  todosAlunos?: { id: string; nome: string; faixa: string }[]
}) {
  const t = useT("professor.presencas")
  const [presencas, setPresencas] = useState(initial)
  const [filtro, setFiltro] = useState<"todas" | "pending" | "confirmed">("todas")
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [showManual, setShowManual] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAluno, setSelectedAluno] = useState<{ id: string; nome: string; faixa: string } | null>(null)
  const [salvandoManual, setSalvandoManual] = useState(false)
  async function confirmar(presencaId: string, status: string) {
    setConfirmando(presencaId)
    const prev = presencas
    setPresencas((p) => p.map((x) => x.id === presencaId ? { ...x, status } : x))
    try {
      const res = await fetch("/api/presenca/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presencaId, status }),
      })
      if (!res.ok) throw new Error()
      toast.success(status === "confirmed" ? t("presencaConfirmada") : t("presencaRecusada"))
    } catch {
      setPresencas(prev)
      toast.error(t("erroConfirmar"))
    } finally {
      setConfirmando(null)
    }
  }

  async function adicionarManual() {
    if (!selectedAluno) { toast.error(t("selecioneAluno")); return }
    setSalvandoManual(true)
    try {
      const res = await fetch("/api/presenca/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alunoId: selectedAluno.id }),
      })
      if (!res.ok) throw new Error()
      const newPresenca: Presenca = {
        id: `manual-${Date.now()}`,
        aluno: { id: selectedAluno.id, nome: selectedAluno.nome, faixa: selectedAluno.faixa },
        data: new Date().toISOString(),
        horario: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        status: "confirmed",
        turma: "",
      }
      setPresencas((prev) => [newPresenca, ...prev])
      toast.success(`${selectedAluno.nome} registrado(a) com sucesso!`)
      setShowManual(false)
      setSelectedAluno(null)
      setSearchTerm("")
    } catch {
      toast.error(t("erroRegistrar"))
    } finally {
      setSalvandoManual(false)
    }
  }

  const filteredAlunos = searchTerm.length > 0
    ? todosAlunos.filter((a) => a.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    : todosAlunos.slice(0, 10)

  const filtradas = filtro === "todas" ? presencas : presencas.filter((p) => p.status === filtro)
  const confirmed = presencas.filter(p => p.status === "confirmed").length
  const pending = presencas.filter(p => p.status === "pending").length

  return (
    <DashboardShell role={role}>
      <PageTransition>
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="hero-title text-lg">{t("title")}</h2>
              <p className="hero-sub">{t("subtitle")}</p>
            </div>
            <button onClick={() => setShowManual(true)}
              className="quick-action">
              <Plus className="quick-action-icon" />
              <span className="quick-action-label">{t("manual")}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="stat-glass">
              <div className="stat-glass-value"><AnimatedCounter value={presencas.length} /></div>
              <div className="stat-glass-label">{t("total")}</div>
            </div>
            <div className="stat-glass">
              <div className="stat-glass-value" style={{ color: "var(--gold)" }}><AnimatedCounter value={confirmed} /></div>
              <div className="stat-glass-label">{t("presentes")}</div>
            </div>
            <div className="stat-glass">
              <div className="stat-glass-value" style={{ color: "var(--gold)" }}><AnimatedCounter value={pending} /></div>
              <div className="stat-glass-label">{t("pendentes")}</div>
            </div>
          </div>

          <div className="tab-bar">
            {(["todas", "pending", "confirmed"] as const).map((f) => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`tab-btn ${filtro === f ? "active" : ""}`}>
                {f === "todas" ? t("todas") : f === "pending" ? <>⏳ {t("pendentes")}</> : <>✅ {t("confirmadas")}</>}
              </button>
            ))}
          </div>

          <div className="glass-card p-4">
            {filtradas.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-2xl mb-2">🥋</div>
                <div className="text-sm font-semibold">{t("nenhumaEncontrada")}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">{t("descEmpty")}</div>
              </div>
            ) : (
              <div className="space-y-0.5">
                {filtradas.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[rgba(255,255,255,0.03)] transition-all">
                    <Avatar name={p.aluno.nome} faixa={p.aluno.faixa} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{p.aluno.nome}</div>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                        <span>{p.aluno.faixa}</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                        <span>{p.turma || t("treino")}</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                        <span>{p.horario}</span>
                      </div>
                    </div>
                    {p.status === "confirmed" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {t("presente")}
                      </span>
                    ) : (
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => confirmar(p.id, "confirmed")} disabled={confirmando === p.id}
                          className="w-9 h-9 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white flex items-center justify-center text-sm font-bold transition-all border border-emerald-600/30 active:scale-[0.97] disabled:opacity-50">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmar(p.id, "rejected")} disabled={confirmando === p.id}
                          className="w-9 h-9 rounded-xl bg-red-700/20 hover:bg-red-700 text-red-400 hover:text-white flex items-center justify-center text-sm font-bold transition-all border border-red-700/30 active:scale-[0.97] disabled:opacity-50">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageTransition>

      <AnimatePresence>
        {showManual && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowManual(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card p-6 w-full max-w-sm mx-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <h3 className="font-bold text-base">{t("adicionarPresenca")}</h3>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  <input className="input-field pl-9 text-sm" placeholder={t("placeholderNome")}
                    value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setSelectedAluno(null) }}
                    autoFocus />
                </div>

                {filteredAlunos.length > 0 && !selectedAluno && (
                  <div className="max-h-48 overflow-y-auto space-y-0.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                    {filteredAlunos.map((a) => (
                      <button key={a.id} onClick={() => setSelectedAluno(a)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-xs hover:bg-[rgba(255,255,255,0.03)] transition-all text-left min-h-[44px]">
                        <Avatar name={a.nome} faixa={a.faixa} size={28} />
                        <span className="font-semibold">{a.nome}</span>
                        <span className="text-[var(--text-muted)]">{a.faixa}</span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedAluno && (
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(212,168,71,0.08)", border: "1px solid rgba(212,168,71,0.2)" }}>
                    <Avatar name={selectedAluno.nome} faixa={selectedAluno.faixa} size={32} />
                    <div>
                      <div className="text-sm font-semibold">{selectedAluno.nome}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{selectedAluno.faixa}</div>
                    </div>
                    <button onClick={() => { setSelectedAluno(null); setSearchTerm("") }} className="ml-auto p-2 min-h-[36px] min-w-[36px] flex items-center justify-center">
                      <X className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                  </div>
                )}

                {searchTerm.length > 0 && filteredAlunos.length === 0 && (
                  <p className="text-xs text-center py-2 text-[var(--text-muted)]">Nenhum aluno encontrado</p>
                )}
              </div>

              <div className="flex gap-2 mt-5">
                <button onClick={adicionarManual} disabled={!selectedAluno || salvandoManual}
                  className="flex-1 py-3 rounded-xl text-sm font-bold active:scale-[0.97] disabled:opacity-50 btn-gold">
                  {salvandoManual ? "Registrando..." : t("confirmar")}
                </button>
                <button onClick={() => { setShowManual(false); setSelectedAluno(null); setSearchTerm("") }}
                  className="flex-1 py-3 rounded-xl text-sm font-bold active:scale-[0.97] btn-ghost">
                  {t("cancelar")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}

"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { PageTransition } from "@/components/ui/page-transition"
import { motion, AnimatePresence } from "framer-motion"
import { useT } from "@/lib/use-t"

type Presenca = {
  id: string
  aluno: { id: string; nome: string; faixa: string }
  data: string
  horario: string
  status: string
  turma: string
}

const playfulPhrases = [
  "📸 ele estava na foto do final do treino?",
  "🥋 jura que viu ele suando no tatame?",
  "🤔 ele pelo menos apareceu pra bater a foto?",
  "😅 o famoso 'eu tava lá' versão Jiu-Jitsu?",
  "🔥 se ele tava no aquecimento, já conta né?",
]

export function PresencasClient({ presencasHoje: initial }: { presencasHoje: Presenca[] }) {
  const t = useT("professor.presencas")
  const [presencas, setPresencas] = useState(initial)
  const [filtro, setFiltro] = useState<"todas" | "pending" | "confirmed">("todas")
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [showManual, setShowManual] = useState(false)
  const [manualNome, setManualNome] = useState("")
  const [manualFaixa, setManualFaixa] = useState("Branca")
  const [playMsg] = useState(() => playfulPhrases[Math.floor(Math.random() * playfulPhrases.length)])

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
    if (!manualNome.trim()) { toast.error(t("digiteNome")); return }
    toast.success(`${manualNome} ${t("alunoRegistrado")}`)
    setShowManual(false)
    setManualNome("")
  }

  const filtradas = filtro === "todas" ? presencas : presencas.filter((p) => p.status === filtro)
  const confirmed = presencas.filter(p => p.status === "confirmed").length
  const pending = presencas.filter(p => p.status === "pending").length

  return (
    <DashboardShell role="professor">
      <PageTransition>
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="surface border border-[var(--gold-dim)] p-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">{t("title")}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t("subtitle")}</p>
            </div>
            <button onClick={() => setShowManual(true)}
              className="btn btn-primary px-4 py-2.5 text-xs font-bold active:scale-95 shrink-0">
              {t("manual")}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-xl mb-1">📋</div>
              <div className="text-xl font-extrabold text-[var(--gold)]"><AnimatedCounter value={presencas.length} /></div>
              <div className="text-[10px] text-[var(--text-secondary)] mt-1 uppercase">{t("total")}</div>
            </div>
            <div className="text-center">
              <div className="text-xl mb-1">✅</div>
              <div className="text-xl font-extrabold text-emerald-500"><AnimatedCounter value={confirmed} /></div>
              <div className="text-[10px] text-[var(--text-secondary)] mt-1 uppercase">{t("presentes")}</div>
            </div>
            <div className="text-center">
              <div className="text-xl mb-1">⏳</div>
              <div className="text-xl font-extrabold text-yellow-500"><AnimatedCounter value={pending} /></div>
              <div className="text-[10px] text-[var(--text-secondary)] mt-1 uppercase">{t("pendentes")}</div>
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

          <div className="surface p-4">
            {filtradas.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-2xl mb-2">🥋</div>
                <div className="text-sm font-semibold">{t("nenhumaEncontrada")}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">{t("descEmpty")}</div>
              </div>
            ) : (
              <div className="space-y-0.5">
                {filtradas.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[var(--border)]/30 transition-all">
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
                        <span className="glow-dot green" /> {t("presente")}
                      </span>
                    ) : (
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => confirmar(p.id, "confirmed")} disabled={confirmando === p.id}
                          className="w-9 h-9 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white flex items-center justify-center text-sm font-bold transition-all border border-emerald-600/30 active:scale-90 disabled:opacity-50">
                          {confirmando === p.id ? "⏳" : "✓"}
                        </button>
                        <button onClick={() => confirmar(p.id, "rejected")} disabled={confirmando === p.id}
                          className="w-9 h-9 rounded-xl bg-red-700/20 hover:bg-red-700 text-red-400 hover:text-white flex items-center justify-center text-sm font-bold transition-all border border-red-700/30 active:scale-90 disabled:opacity-50">
                          ✗
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

      {/* MODAL PRESENÇA MANUAL */}
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
              className="surface p-6 w-full max-w-sm mx-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">📸</div>
                <h3 className="font-bold text-base">{t("adicionarPresenca")}</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1 italic">{playMsg}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">{t("nomeAluno")}</label>
                  <input className="input text-sm" placeholder={t("placeholderNome")}
                    value={manualNome} onChange={e => setManualNome(e.target.value)}
                    autoFocus />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">{t("faixa")}</label>
                  <select className="input text-sm" value={manualFaixa} onChange={e => setManualFaixa(e.target.value)}>
                    {["Branca", "Azul", "Roxa", "Marrom", "Preta"].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button onClick={adicionarManual}
                  className="flex-1 py-3 rounded-xl btn btn-primary text-sm font-bold active:scale-[0.97]">
                  {t("confirmar")}
                </button>
                <button onClick={() => setShowManual(false)}
                  className="flex-1 py-3 rounded-xl bg-[var(--border)] text-[var(--text-secondary)] text-sm font-bold active:scale-[0.97]">
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

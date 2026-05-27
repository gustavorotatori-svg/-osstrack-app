"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { PageTransition } from "@/components/ui/page-transition"

type Presenca = {
  id: string
  aluno: { id: string; nome: string; faixa: string }
  data: string
  horario: string
  status: string
  turma: string
}

export function PresencasClient({ presencasHoje: initial }: { presencasHoje: Presenca[] }) {
  const [presencas, setPresencas] = useState(initial)
  const [filtro, setFiltro] = useState<"todas" | "pending" | "confirmed">("todas")

  async function confirmar(presencaId: string, status: string) {
    await fetch("/api/presenca/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presencaId, status }),
    })
    setPresencas((prev) => prev.map((p) => p.id === presencaId ? { ...p, status } : p))
  }

  const filtradas = filtro === "todas" ? presencas : presencas.filter((p) => p.status === filtro)
  const confirmed = presencas.filter(p => p.status === "confirmed").length
  const pending = presencas.filter(p => p.status === "pending").length

  return (
    <DashboardShell role="professor">
      <PageTransition>
        <div className="space-y-5">
          {/* Header */}
          <div className="glass-card-gold p-5">
            <h2 className="text-lg font-extrabold tracking-tight">📋 Presenças</h2>
            <p className="text-xs text-[var(--white-muted)] mt-1">Gerencie os check-ins do dia</p>
          </div>

          {/* Status row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="stat-card">
              <div className="text-lg mb-1">📋</div>
              <div className="text-xl font-extrabold text-[var(--gold)]"><AnimatedCounter value={presencas.length} /></div>
              <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase">Total</div>
            </div>
            <div className="stat-card">
              <div className="text-lg mb-1">✅</div>
              <div className="text-xl font-extrabold text-emerald-500"><AnimatedCounter value={confirmed} /></div>
              <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase">Presentes</div>
            </div>
            <div className="stat-card">
              <div className="text-lg mb-1">⏳</div>
              <div className="text-xl font-extrabold text-yellow-500"><AnimatedCounter value={pending} /></div>
              <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase">Pendentes</div>
            </div>
          </div>

          {/* Filter */}
          <div className="tab-bar">
            {(["todas", "pending", "confirmed"] as const).map((f) => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`tab-btn ${filtro === f ? "active" : ""}`}>
                {f === "todas" ? "Todas" : f === "pending" ? "⏳ Pendentes" : "✅ Confirmadas"}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="glass-card p-5">
            {filtradas.length === 0 ? (
              <div className="empty-premium">
                <div className="empty-premium-icon">🥋</div>
                <div className="empty-premium-title">Nenhuma presença encontrada</div>
                <div className="empty-premium-desc">Nenhum registro com este filtro. Alunos aparecerão aqui quando fizerem check-in.</div>
              </div>
            ) : (
              <div className="space-y-1">
                {filtradas.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-[var(--dark-border)]/30 transition-all">
                    <Avatar name={p.aluno.nome} faixa={p.aluno.faixa} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{p.aluno.nome}</div>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--white-muted)]">
                        <span>{p.aluno.faixa}</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--dark-border)]" />
                        <span>{p.turma || "Treino"}</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--dark-border)]" />
                        <span>{p.horario}</span>
                      </div>
                    </div>
                    {p.status === "confirmed" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="glow-dot green" /> Presente
                      </span>
                    ) : (
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => confirmar(p.id, "confirmed")}
                          className="w-9 h-9 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white flex items-center justify-center text-sm font-bold transition-all border border-emerald-600/30">✓</button>
                        <button onClick={() => confirmar(p.id, "rejected")}
                          className="w-9 h-9 rounded-xl bg-red-700/20 hover:bg-red-700 text-red-400 hover:text-white flex items-center justify-center text-sm font-bold transition-all border border-red-700/30">✗</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

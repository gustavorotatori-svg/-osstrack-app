"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { PageTransition } from "@/components/ui/page-transition"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"

type Props = {
  academia: { nome: string; responsavel: string }
  stats: { totalAlunos: number; totalProfessores: number; totalPresencas: number }
  alunos: { id: string; nome: string; faixa: string; grau: number }[]
  presencas: { id: string; aluno: string; data: string; horario: string; status: string }[]
  graduacoes: { faixa: string; graus: number; aulasPorGrau: number; aulasProxFx: number | null }[]
}

const beltColors: Record<string, string> = {
  Branca: "bg-[#e5e5e5] text-black", Azul: "bg-blue-700 text-white", Roxa: "bg-purple-700 text-white",
  Marrom: "bg-amber-800 text-white", Preta: "bg-gray-900 text-[var(--gold)]",
}

export function OwnerDashboardClient({ academia, stats, alunos, presencas, graduacoes }: Props) {
  const [tab, setTab] = useState<"geral" | "alunos" | "graduacoes">("geral")

  const presencasPorMes = presencas.filter(p => {
    const m = new Date(p.data).getMonth()
    return m === new Date().getMonth()
  }).length

  return (
    <DashboardShell role="dono">
      <PageTransition>
        <div className="space-y-5">
          {/* Hero */}
          <div className="glass-card-gold p-6 text-center relative overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-28 h-28 bg-[var(--gold)]/5 rounded-full blur-3xl" />
            <div className="text-4xl mb-2">🥋</div>
            <h2 className="text-xl font-extrabold tracking-tight">{academia.nome}</h2>
            <p className="text-xs text-[var(--white-muted)] mt-1.5">👑 {academia.responsavel}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 enter-stagger">
            <div className="stat-card">
              <div className="text-lg mb-1">👥</div>
              <div className="text-2xl font-extrabold text-[var(--gold)]"><AnimatedCounter value={stats.totalAlunos} /></div>
              <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">Alunos</div>
            </div>
            <div className="stat-card">
              <div className="text-lg mb-1">👨‍🏫</div>
              <div className="text-2xl font-extrabold text-emerald-500"><AnimatedCounter value={stats.totalProfessores} /></div>
              <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">Professores</div>
            </div>
            <div className="stat-card">
              <div className="text-lg mb-1">✅</div>
              <div className="text-2xl font-extrabold text-[var(--gold)]"><AnimatedCounter value={stats.totalPresencas} /></div>
              <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">Total Presenças</div>
            </div>
            <div className="stat-card">
              <div className="text-lg mb-1">📊</div>
              <div className="text-2xl font-extrabold text-blue-500"><AnimatedCounter value={presencasPorMes} /></div>
              <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">Este Mês</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tab-bar">
            <button className={`tab-btn ${tab === "geral" ? "active" : ""}`} onClick={() => setTab("geral")}>
              📋 Geral
            </button>
            <button className={`tab-btn ${tab === "alunos" ? "active" : ""}`} onClick={() => setTab("alunos")}>
              👥 Alunos {alunos.length > 0 && <span className="ml-1 text-[10px] opacity-60">{alunos.length}</span>}
            </button>
            <button className={`tab-btn ${tab === "graduacoes" ? "active" : ""}`} onClick={() => setTab("graduacoes")}>
              🥋 Graduações
            </button>
          </div>

          {/* Tab: Geral */}
          {tab === "geral" && (
            <div className="space-y-4">
              {/* Presenças recentes */}
              <div className="glass-card p-5">
                <h3 className="font-bold text-sm tracking-tight mb-4">Presenças Recentes</h3>
                {presencas.length === 0 ? (
                  <div className="empty-premium">
                    <div className="empty-premium-icon">📋</div>
                    <div className="empty-premium-title">Nenhuma presença registrada</div>
                    <div className="empty-premium-desc">As presenças aparecerão aqui conforme os alunos fizerem check-in.</div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {presencas.slice(0, 10).map((p) => (
                      <div key={p.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[var(--dark-border)]/30 transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{p.aluno}</div>
                          <div className="text-xs text-[var(--white-muted)]">{new Date(p.data).toLocaleDateString("pt-BR")} às {p.horario}</div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          p.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        }`}>
                          {p.status === "confirmed" ? "Presente" : "Pendente"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Distribution by belt */}
              <div className="glass-card p-5">
                <h3 className="font-bold text-sm tracking-tight mb-4">Alunos por Faixa</h3>
                {alunos.length === 0 ? (
                  <p className="text-sm text-[var(--white-muted)] text-center py-6">Nenhum aluno cadastrado</p>
                ) : (
                  <div className="space-y-2">
                    {["Branca", "Azul", "Roxa", "Marrom", "Preta"].map((faixa) => {
                      const count = alunos.filter(a => a.faixa === faixa).length
                      const pct = Math.round((count / alunos.length) * 100)
                      if (count === 0) return null
                      return (
                        <div key={faixa} className="flex items-center gap-3">
                          <span className="text-[11px] font-semibold w-14 shrink-0">{beltColors[faixa] ? getBeltEmoji(faixa) : "⬜"} {faixa}</span>
                          <div className="progress-gold flex-1">
                            <div className="progress-gold-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[11px] font-semibold text-[var(--white-muted)] w-10 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Alunos */}
          {tab === "alunos" && (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm tracking-tight">Todos os Alunos</h3>
                <span className="tag-premium">{alunos.length} total</span>
              </div>
              {alunos.length === 0 ? (
                <div className="empty-premium">
                  <div className="empty-premium-icon">👥</div>
                  <div className="empty-premium-title">Nenhum aluno ainda</div>
                  <div className="empty-premium-desc">Os alunos aparecerão aqui conforme se cadastrarem na academia.</div>
                </div>
              ) : (
                <div className="space-y-1">
                  {alunos.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[var(--dark-border)]/30 transition-all">
                      <Avatar name={a.nome} faixa={a.faixa} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{a.nome}</div>
                        <div className="text-xs text-[var(--white-muted)]">{a.faixa} · {'★'.repeat(a.grau + 1)}</div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${getBeltColor(a.faixa)}`}>
                        {getBeltEmoji(a.faixa)} {a.faixa}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Graduações */}
          {tab === "graduacoes" && (
            <div className="glass-card p-5">
              <h3 className="font-bold text-sm tracking-tight mb-4">Regras de Graduação</h3>
              {graduacoes.length === 0 ? (
                <div className="empty-premium">
                  <div className="empty-premium-icon">🥋</div>
                  <div className="empty-premium-title">Nenhuma regra configurada</div>
                  <div className="empty-premium-desc">Crie regras de graduação para definir a progressão dos alunos.</div>
                </div>
              ) : (
                <div className="grid-modern">
                  {graduacoes.map((g) => (
                    <div key={g.faixa} className="glass-card p-4">
                      <div className="font-bold text-sm">{getBeltEmoji(g.faixa)} {g.faixa}</div>
                      <div className="space-y-1 mt-2">
                        <div className="text-xs text-[var(--white-muted)]">{g.graus} graus · {g.aulasPorGrau} aulas/grau</div>
                        {g.aulasProxFx && (
                          <div className="text-xs text-[var(--gold)] font-semibold">{g.aulasProxFx} aulas p/ próx. faixa</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Crown, TrendingUp, HelpCircle, Target, ArrowUpRight, BarChart3, Users, GraduationCap, Calendar, Settings, Wallet, FileText } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { PageTransition } from "@/components/ui/page-transition"
import { ConviteSection } from "@/components/convites/convite-section"
import { MestreDoMesCard } from "@/components/gamification/mestre-do-mes-card"
import { UsersIcon, GraduationIcon, AwardIcon, ClipboardIcon, CalendarIcon } from "@/components/ui/icons"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"
import { toast } from "sonner"
import { useT } from "@/lib/use-t"
import { useRouter } from "next/navigation"

type Props = {
  academia: { nome: string; responsavel: string; rankingVisivel: boolean }
  stats: { totalAlunos: number; totalProfessores: number; totalPresencas: number }
  presencasMensais: { mes: string; total: number }[]
  alunosPorCategoria: { categoria: string; total: number }[]
  alunos: { id: string; nome: string; faixa: string; grau: number; categoria: string }[]
  presencas: { id: string; aluno: string; data: string; horario: string; status: string }[]
  graduacoes: { faixa: string; graus: number; aulasPorGrau: number; aulasProxFx: number | null }[]
}

const quickActions = [
  { label: "Turmas", icon: CalendarIcon, href: "/dashboard/dono/turmas", color: "from-blue-600/20 to-blue-600/5", border: "border-blue-500/20" },
  { label: "Alunos", icon: UsersIcon, href: "/dashboard/dono/alunos", color: "from-emerald-600/20 to-emerald-600/5", border: "border-emerald-500/20" },
  { label: "Financeiro", icon: Wallet, href: "/dashboard/dono/financeiro", color: "from-yellow-600/20 to-yellow-600/5", border: "border-yellow-500/20" },
  { label: "Relatórios", icon: FileText, href: "/dashboard/dono/relatorios", color: "from-purple-600/20 to-purple-600/5", border: "border-purple-500/20" },
  { label: "Agenda", icon: Calendar, href: "/dashboard/dono/agenda", color: "from-pink-600/20 to-pink-600/5", border: "border-pink-500/20" },
  { label: "Config", icon: Settings, href: "/dashboard/dono/config", color: "from-gray-600/20 to-gray-600/5", border: "border-gray-500/20" },
]

export function OwnerDashboardClient({ academia, stats, presencasMensais, alunosPorCategoria, alunos, presencas, graduacoes }: Props) {
  const t = useT("dono.dashboard")
  const router = useRouter()
  const [tab, setTab] = useState<"geral" | "alunos" | "graduacoes" | "ranking" | "prospectos">("geral")
  const [prospectStats, setProspectStats] = useState<{ stats: { total: number; usados: number; pendentes: number; expirados: number; conversao: number }; porTipo: { tipo: string; total: number }[]; ultimos: { id: string; tipo: string; codigo: string; usado: boolean; createdAt: string; expiresAt: string | null }[] } | null>(null)

  useEffect(() => {
    fetch("/api/prospectos").then((r) => r.json()).then(setProspectStats).catch(() => {})
  }, [])
  const [rankingVisivel, setRankingVisivel] = useState(academia.rankingVisivel)
  const [toggling, setToggling] = useState(false)

  async function toggleRanking() {
    setToggling(true)
    try {
      const res = await fetch("/api/ranking/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rankingVisivel: !rankingVisivel }),
      })
      if (!res.ok) throw new Error()
      setRankingVisivel(!rankingVisivel)
      toast.success(rankingVisivel ? t("rankingOculto") : t("rankingVisivel"))
    } catch {
      toast.error(t("erroVisibilidade"))
    } finally {
      setToggling(false)
    }
  }

  const presencasPorMes = presencas.filter(p => {
    const m = new Date(p.data).getMonth()
    return m === new Date().getMonth()
  }).length

  const maxPresencasMes = Math.max(...presencasMensais.map((p) => p.total), 1)

  // Month-over-month growth
  const mesAtual = presencasMensais[presencasMensais.length - 1]?.total || 0
  const mesAnterior = presencasMensais[presencasMensais.length - 2]?.total || 0
  const growth = mesAnterior > 0 ? Math.round(((mesAtual - mesAnterior) / mesAnterior) * 100) : 0

  return (
    <DashboardShell role="dono">
      <PageTransition>
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Tech Hero */}
          <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-[rgba(201,168,76,0.08)] via-[rgba(10,10,10,0.8)] to-[rgba(10,10,10,0.9)] p-6">
            <div className="absolute top-[-60px] right-[-60px] w-40 h-40 bg-[var(--gold)]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-[-40px] left-[-40px] w-32 h-32 bg-[var(--gold)]/3 rounded-full blur-3xl" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-[var(--gold)]" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--gold)]">Dono</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight">{academia.nome}</h1>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{academia.responsavel}</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-3 py-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="font-semibold">{growth > 0 ? "+" : ""}{growth}%</span>
                <span className="text-emerald-400/60">vs mês anterior</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <button key={action.label} onClick={() => router.push(action.href)}
                  className={`relative overflow-hidden rounded-xl border ${action.border} p-3 text-center transition-all hover:scale-[1.02] active:scale-95 group`}
                  style={{ background: `linear-gradient(135deg, ${action.color.split(" ")[0].replace("from-", "")}, ${action.color.split(" ")[1].replace("to-", "")})` }}>
                  <Icon className="w-5 h-5 mx-auto mb-1.5 text-[var(--text-secondary)] group-hover:text-white transition-colors" />
                  <span className="text-[10px] font-semibold text-[var(--text-secondary)] group-hover:text-white transition-colors">{action.label}</span>
                  <ArrowUpRight className="w-3 h-3 absolute top-1.5 right-1.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              )
            })}
          </div>

          {/* Tech Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="tech-stat">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-4 h-4 text-[rgba(255,255,255,0.25)]" />
                <span className="live-dot" />
              </div>
              <div className="tech-stat-value"><AnimatedCounter value={stats.totalAlunos} /></div>
              <div className="tech-stat-label">{t("alunos")}</div>
            </div>
            <div className="tech-stat">
              <div className="flex items-center justify-between mb-2">
                <GraduationCap className="w-4 h-4 text-[rgba(255,255,255,0.25)]" />
                <span className="live-dot" />
              </div>
              <div className="tech-stat-value"><AnimatedCounter value={stats.totalProfessores} /></div>
              <div className="tech-stat-label">{t("professores")}</div>
            </div>
            <div className="tech-stat">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-4 h-4 text-[rgba(255,255,255,0.25)]" />
                <span className="live-dot" />
              </div>
              <div className="tech-stat-value"><AnimatedCounter value={stats.totalPresencas} /></div>
              <div className="tech-stat-label">{t("presencas")}</div>
            </div>
            <div className="tech-stat">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-4 h-4 text-[rgba(255,255,255,0.25)]" />
                <span className={`w-1.5 h-1.5 rounded-full ${presencasPorMes > 0 ? "bg-emerald-500" : "bg-gray-500"} inline-block`} />
              </div>
              <div className="tech-stat-value"><AnimatedCounter value={presencasPorMes} /></div>
              <div className="tech-stat-label">{t("esteMes")}</div>
            </div>
          </div>

          {/* Growth metric mobile */}
          <div className="flex sm:hidden items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-3 py-2 justify-center">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="font-semibold">{growth > 0 ? "+" : ""}{growth}%</span>
            <span className="text-emerald-400/60">crescimento vs mês anterior</span>
          </div>

          {/* Monthly chart */}
          <div className="tech-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="section-header mb-0">{t("presencasPorMes")}</div>
              <span className="text-[10px] text-[var(--text-muted)]">Últimos 6 meses</span>
            </div>
            <div className="flex items-end gap-2 h-24">
              {presencasMensais.map((p, i) => {
                const height = Math.max(4, (p.total / maxPresencasMes) * 80)
                const isCurrent = i === presencasMensais.length - 1
                return (
                  <div key={p.mes} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-[var(--text)]">{p.total}</span>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 relative overflow-hidden ${isCurrent ? "tech-glow" : ""}`}
                      style={{ height: `${height}px`, background: isCurrent ? "linear-gradient(180deg, var(--gold) 0%, rgba(201,168,76,0.4) 100%)" : "rgba(255,255,255,0.08)" }}
                    />
                    <span className="text-[8px] text-[var(--text-muted)]">{p.mes}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tabs */}
          <div className="tab-bar">
            <button className={`tab-btn gap-1.5 ${tab === "geral" ? "active" : ""}`} onClick={() => setTab("geral")}>
              <ClipboardIcon className="w-4 h-4" /> {t("geral")}
            </button>
            <button className={`tab-btn gap-1.5 ${tab === "alunos" ? "active" : ""}`} onClick={() => setTab("alunos")}>
              <UsersIcon className="w-4 h-4" /> {t("alunos")} {alunos.length > 0 && <span className="ml-1 text-[10px] opacity-60">{alunos.length}</span>}
            </button>
            <button className={`tab-btn gap-1.5 ${tab === "graduacoes" ? "active" : ""}`} onClick={() => setTab("graduacoes")}>
              <GraduationIcon className="w-4 h-4" /> {t("graduacoes")}
            </button>
            <button className={`tab-btn gap-1.5 ${tab === "ranking" ? "active" : ""}`} onClick={() => setTab("ranking")}>
              <AwardIcon className="w-4 h-4" /> {t("ranking")}
            </button>
            <button className={`tab-btn gap-1.5 ${tab === "prospectos" ? "active" : ""}`} onClick={() => setTab("prospectos")}>
              <Target className="w-4 h-4" /> Prospectos
            </button>
          </div>

          {/* Tab: Geral */}
          {tab === "geral" && (
            <div className="space-y-3">
              <MestreDoMesCard />

              <div className="tech-card p-5">
                <div className="section-header">{t("alunosPorCategoria")}</div>
                {alunosPorCategoria.length === 0 ? (
                  <p className="text-sm text-[var(--text-secondary)] text-center py-4">{t("nenhumAluno")}</p>
                ) : (
                  <div className="space-y-2">
                    {alunosPorCategoria.map((cat) => {
                      const pct = stats.totalAlunos > 0 ? Math.round((cat.total / stats.totalAlunos) * 100) : 0
                      return (
                        <div key={cat.categoria} className="flex items-center gap-3">
                          <span className="text-xs font-semibold w-20 shrink-0 capitalize">{cat.categoria}</span>
                          <div className="progress flex-1">
                            <div className="progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-[var(--text-secondary)] w-10 text-right">{cat.total}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="tech-card p-5">
                <div className="section-header">{t("alunosPorFaixa")}</div>
                {alunos.length === 0 ? (
                  <p className="text-sm text-[var(--text-secondary)] text-center py-6">{t("nenhumAluno")}</p>
                ) : (
                  <div className="space-y-2">
                    {["Branca", "Azul", "Roxa", "Marrom", "Preta"].map((faixa) => {
                      const count = alunos.filter(a => a.faixa === faixa).length
                      const pct = Math.round((count / alunos.length) * 100)
                      if (count === 0) return null
                      return (
                        <div key={faixa} className="flex items-center gap-3">
                          <span className="text-xs font-semibold w-16 shrink-0">{getBeltEmoji(faixa)} {faixa}</span>
                          <div className="progress flex-1">
                            <div className="progress-fill-gold" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-[var(--text-secondary)] w-10 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="tech-card p-5">
                <div className="section-header">{t("presencasRecentes")}</div>
                {presencas.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-[var(--text-secondary)]">{t("nenhumaPresenca")}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{t("descEmptyPresencas")}</p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {presencas.slice(0, 10).map((p) => (
                      <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-[rgba(255,255,255,0.03)] last:border-0">
                        <div className="flex-1 min-w-0">
                          <div className="text-base font-semibold truncate">{p.aluno}</div>
                          <div className="text-sm text-[var(--text-secondary)]">{new Date(p.data).toLocaleDateString("pt-BR")} às {p.horario}</div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          p.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        }`}>
                          {p.status === "confirmed" ? t("presente") : t("pendente")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Alunos */}
          {tab === "alunos" && (
            <div className="tech-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="section-header mb-0">{t("todosAlunos")}</div>
                <span className="badge">{alunos.length} {t("total")}</span>
              </div>
              {alunos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[var(--text-secondary)]">{t("nenhumAlunoAinda")}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{t("descEmptyAlunos")}</p>
                </div>
              ) : (
                <div className="grid-modern">
                  {alunos.map((a) => (
                    <div key={a.id} className="surface p-4 text-center">
                      <Avatar name={a.nome} faixa={a.faixa} size={44} />
                      <div className="text-base font-semibold mt-1.5 truncate">{a.nome}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{a.faixa} · {'★'.repeat(a.grau + 1)}</div>
                      <span className="inline-block mt-1 text-[10px] text-[var(--text-muted)] capitalize">{a.categoria}</span>
                      <span className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full ${getBeltColor(a.faixa)}`}>
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
            <div className="tech-card p-5">
              <div className="section-header">{t("regrasGraduacao")}</div>
              {graduacoes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[var(--text-secondary)]">{t("nenhumaRegra")}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{t("descEmptyGraduacoes")}</p>
                </div>
              ) : (
                <div className="grid-modern">
                  {graduacoes.map((g) => (
                    <div key={g.faixa} className="surface p-4">
                      <div className="font-bold text-base">{getBeltEmoji(g.faixa)} {g.faixa}</div>
                      <div className="space-y-1 mt-2">
                        <div className="text-sm text-[var(--text-secondary)]">{g.graus} graus · {g.aulasPorGrau} aulas/grau</div>
                        {g.aulasProxFx && (
                          <div className="text-sm text-[var(--gold)] font-semibold">{g.aulasProxFx} aulas p/ próx. faixa</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Prospectos */}
          {tab === "prospectos" && (
            <div className="space-y-3">
              <div className="tech-card p-5">
                <div className="section-header">Funil de Prospecção</div>
                {!prospectStats ? (
                  <p className="text-sm text-[var(--text-secondary)] text-center py-4">Carregando...</p>
                ) : (
                  <>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="stat">
                        <div className="stat-value text-2xl"><AnimatedCounter value={prospectStats.stats.total} /></div>
                        <div className="stat-label">Total</div>
                      </div>
                      <div className="stat">
                        <div className="stat-value text-2xl text-emerald-500"><AnimatedCounter value={prospectStats.stats.usados} /></div>
                        <div className="stat-label">Convertidos</div>
                      </div>
                      <div className="stat">
                        <div className="stat-value text-2xl text-yellow-500"><AnimatedCounter value={prospectStats.stats.pendentes} /></div>
                        <div className="stat-label">Pendentes</div>
                      </div>
                      <div className="stat">
                        <div className="stat-value text-2xl text-blue-500">{prospectStats.stats.conversao}%</div>
                        <div className="stat-label">Conversão</div>
                      </div>
                    </div>

                    {prospectStats.porTipo.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Convites por tipo</div>
                        {prospectStats.porTipo.map((t) => (
                          <div key={t.tipo} className="flex items-center gap-3">
                            <span className="text-xs font-semibold w-20 shrink-0 capitalize">{t.tipo}</span>
                            <div className="progress flex-1">
                              <div className="progress-fill" style={{ width: `${(t.total / prospectStats.stats.total) * 100}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-[var(--text-secondary)]">{t.total}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-[var(--text-secondary)] p-3 rounded-lg bg-[var(--red-dim)] border border-[var(--red)]/20 flex items-start gap-2">
                      <Target className="w-3.5 h-3.5 text-[var(--red)] mt-0.5 shrink-0" />
                      <span>Compartilhe o link de convite com prospects. Quando eles se cadastrarem, serão contabilizados como convertidos.</span>
                    </div>
                  </>
                )}
              </div>

              {prospectStats && prospectStats.ultimos.length > 0 && (
                <div className="tech-card p-5">
                  <div className="section-header">Últimos Convites</div>
                  <div className="space-y-1">
                    {prospectStats.ultimos.map((c) => (
                      <div key={c.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${c.usado ? "bg-emerald-500" : c.expiresAt && new Date(c.expiresAt) < new Date() ? "bg-red-500" : "bg-yellow-500"}`} />
                          <span className="text-xs font-semibold capitalize">{c.tipo}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">{c.codigo}</span>
                        </div>
                        <span className="text-[10px] text-[var(--text-secondary)]">
                          {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <ConviteSection tipo="aluno" />
              <ConviteSection tipo="professor" />
            </div>
          )}

          {/* Tab: Ranking */}
          {tab === "ranking" && (
            <div className="space-y-3">
              <div className="tech-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="section-header mb-0">{t("configRanking")}</div>
                </div>
                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                  <div>
                    <div className="text-sm font-semibold">{t("visivelAlunos")}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{t("descRanking")}</div>
                  </div>
                  <button
                    onClick={toggleRanking}
                    disabled={toggling}
                    className={`relative w-12 h-7 rounded-full transition-all ${rankingVisivel ? "bg-emerald-600" : "bg-[var(--border)]"}`}
                  >
                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all ${rankingVisivel ? "left-5.5" : "left-0.5"}`} />
                  </button>
                </div>
                <div className="mt-3 text-xs text-[var(--text-secondary)] p-3 rounded-lg bg-[var(--red-dim)] border border-[var(--red)]/20 flex items-start gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-[var(--red)] mt-0.5 shrink-0" />
                  <span>{t("infoRanking")}</span>
                </div>
              </div>
            </div>
          )}

          {/* Convites */}
          {tab !== "prospectos" && (
            <>
              <ConviteSection tipo="professor" />
              <ConviteSection tipo="aluno" />
            </>
          )}
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

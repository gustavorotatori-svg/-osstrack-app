"use client"

import { useState, useEffect } from "react"
import { Crown, TrendingUp, HelpCircle, Target, UserPlus } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { PageTransition } from "@/components/ui/page-transition"
import { ConviteSection } from "@/components/convites/convite-section"
import { MestreDoMesCard } from "@/components/gamification/mestre-do-mes-card"
import { UsersIcon, GraduationIcon, CheckIcon, ChartIcon, AwardIcon, ClipboardIcon, DumbbellIcon } from "@/components/ui/icons"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"
import { toast } from "sonner"
import { useT } from "@/lib/use-t"

type Props = {
  academia: { nome: string; responsavel: string; rankingVisivel: boolean }
  stats: { totalAlunos: number; totalProfessores: number; totalPresencas: number }
  presencasMensais: { mes: string; total: number }[]
  alunosPorCategoria: { categoria: string; total: number }[]
  alunos: { id: string; nome: string; faixa: string; grau: number; categoria: string }[]
  presencas: { id: string; aluno: string; data: string; horario: string; status: string }[]
  graduacoes: { faixa: string; graus: number; aulasPorGrau: number; aulasProxFx: number | null }[]
}

const beltColors: Record<string, string> = {
  Branca: "bg-[#e5e5e5] text-black", Azul: "bg-blue-700 text-white", Roxa: "bg-purple-700 text-white",
  Marrom: "bg-amber-800 text-white", Preta: "bg-gray-900 text-[var(--gold)]",
}

export function OwnerDashboardClient({ academia, stats, presencasMensais, alunosPorCategoria, alunos, presencas, graduacoes }: Props) {
  const t = useT("dono.dashboard")
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

  return (
    <DashboardShell role="dono">
      <PageTransition>
        <div className="space-y-3">
          {/* Hero */}
          <div className="glass-card-gold p-6 text-center relative overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-28 h-28 bg-[var(--gold)]/5 rounded-full blur-3xl" />
            <DumbbellIcon className="w-9 h-9 mx-auto mb-2 text-[var(--gold)]" />
            <h2 className="text-xl font-extrabold tracking-tight">{academia.nome}</h2>
            <p className="text-xs text-[var(--white-muted)] mt-1.5 flex items-center justify-center gap-1">
              <Crown className="w-3.5 h-3.5 text-[var(--gold)]" /> {academia.responsavel}
            </p>
          </div>

          {/* Stats reais */}
          <div className="grid grid-cols-2 gap-2 enter-stagger">
            <div className="stat-card">
              <UsersIcon className="w-6 h-6 mb-1 mx-auto text-[var(--gold)]" />
              <div className="text-3xl font-extrabold text-[var(--gold)]"><AnimatedCounter value={stats.totalAlunos} /></div>
              <div className="text-xs text-[var(--white-muted)] mt-1 uppercase tracking-wide">{t("alunos")}</div>
            </div>
            <div className="stat-card">
              <GraduationIcon className="w-6 h-6 mb-1 mx-auto text-emerald-500" />
              <div className="text-3xl font-extrabold text-emerald-500"><AnimatedCounter value={stats.totalProfessores} /></div>
              <div className="text-xs text-[var(--white-muted)] mt-1 uppercase tracking-wide">{t("professores")}</div>
            </div>
            <div className="stat-card">
              <CheckIcon className="w-6 h-6 mb-1 mx-auto text-[var(--gold)]" />
              <div className="text-3xl font-extrabold text-[var(--gold)]"><AnimatedCounter value={stats.totalPresencas} /></div>
              <div className="text-xs text-[var(--white-muted)] mt-1 uppercase tracking-wide">{t("presencas")}</div>
            </div>
            <div className="stat-card">
              <ChartIcon className="w-6 h-6 mb-1 mx-auto text-blue-500" />
              <div className="text-3xl font-extrabold text-blue-500"><AnimatedCounter value={presencasPorMes} /></div>
              <div className="text-xs text-[var(--white-muted)] mt-1 uppercase tracking-wide">{t("esteMes")}</div>
            </div>
          </div>

          {/* Gráfico de presenças mensais */}
          <div className="glass-card">
            <h3 className="font-bold text-base tracking-tight mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[var(--gold)]" /> {t("presencasPorMes")}
            </h3>
            <div className="flex items-end gap-2 h-20">
              {presencasMensais.map((p) => (
                <div key={p.mes} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${Math.max(4, (p.total / maxPresencasMes) * 64)}px`,
                      background: "linear-gradient(180deg, var(--gold), var(--gold-dark))",
                      opacity: p.total > 0 ? 0.8 : 0.2,
                    }}
                  />
                  <span className="text-[8px] text-[var(--gray)]">{p.mes}</span>
                  <span className="text-[9px] font-bold text-[var(--white-muted)]">{p.total}</span>
                </div>
              ))}
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

              <div className="glass-card">
                <h3 className="font-bold text-base tracking-tight mb-3 flex items-center gap-1.5">
                  <DumbbellIcon className="w-4 h-4 text-[var(--gold)]" /> {t("alunosPorCategoria")}
                </h3>
                {alunosPorCategoria.length === 0 ? (
                  <p className="text-sm text-[var(--white-muted)] text-center py-4">{t("nenhumAluno")}</p>
                ) : (
                  <div className="space-y-2">
                    {alunosPorCategoria.map((cat) => {
                      const pct = stats.totalAlunos > 0 ? Math.round((cat.total / stats.totalAlunos) * 100) : 0
                      return (
                        <div key={cat.categoria} className="flex items-center gap-3">
                          <span className="text-xs font-semibold w-20 shrink-0 capitalize">{cat.categoria}</span>
                          <div className="progress-gold flex-1">
                            <div className="progress-gold-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-[var(--white-muted)] w-10 text-right">{cat.total}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="glass-card">
                <h3 className="font-bold text-base tracking-tight mb-3 flex items-center gap-1.5">
                  <GraduationIcon className="w-4 h-4 text-[var(--gold)]" /> {t("alunosPorFaixa")}
                </h3>
                {alunos.length === 0 ? (
                  <p className="text-sm text-[var(--white-muted)] text-center py-6">{t("nenhumAluno")}</p>
                ) : (
                  <div className="space-y-2">
                    {["Branca", "Azul", "Roxa", "Marrom", "Preta"].map((faixa) => {
                      const count = alunos.filter(a => a.faixa === faixa).length
                      const pct = Math.round((count / alunos.length) * 100)
                      if (count === 0) return null
                      return (
                        <div key={faixa} className="flex items-center gap-3">
                          <span className="text-xs font-semibold w-16 shrink-0">{getBeltEmoji(faixa)} {faixa}</span>
                          <div className="progress-gold flex-1">
                            <div className="progress-gold-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-[var(--white-muted)] w-10 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="glass-card">
                <h3 className="font-bold text-base tracking-tight mb-3 flex items-center gap-1.5">
                  <ClipboardIcon className="w-4 h-4 text-[var(--gold)]" /> {t("presencasRecentes")}
                </h3>
                {presencas.length === 0 ? (
                  <div className="empty-premium">
                    <div className="empty-premium-icon">
                      <ClipboardIcon className="w-6 h-6 text-[var(--gold)]" />
                    </div>
                    <div className="empty-premium-title">{t("nenhumaPresenca")}</div>
                    <div className="empty-premium-desc">{t("descEmptyPresencas")}</div>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {presencas.slice(0, 10).map((p) => (
                      <div key={p.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[var(--dark-border)]/30 transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="text-base font-semibold truncate">{p.aluno}</div>
                          <div className="text-sm text-[var(--white-muted)]">{new Date(p.data).toLocaleDateString("pt-BR")} às {p.horario}</div>
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
            <div className="glass-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base tracking-tight flex items-center gap-1.5">
                  <UsersIcon className="w-4 h-4 text-[var(--gold)]" /> {t("todosAlunos")}
                </h3>
                <span className="tag-premium">{alunos.length} {t("total")}</span>
              </div>
              {alunos.length === 0 ? (
                <div className="empty-premium">
                  <div className="empty-premium-icon">
                    <UsersIcon className="w-6 h-6 text-[var(--gold)]" />
                  </div>
                  <div className="empty-premium-title">{t("nenhumAlunoAinda")}</div>
                  <div className="empty-premium-desc">{t("descEmptyAlunos")}</div>
                </div>
              ) : (
                <div className="grid-modern">
                  {alunos.map((a) => (
                    <div key={a.id} className="glass-card text-center hover-lift">
                      <Avatar name={a.nome} faixa={a.faixa} size={44} />
                      <div className="text-base font-semibold mt-1.5 truncate">{a.nome}</div>
                      <div className="text-xs text-[var(--white-muted)]">{a.faixa} · {'★'.repeat(a.grau + 1)}</div>
                      <span className={`inline-block mt-1 text-[10px] text-[var(--gray)] capitalize`}>{a.categoria}</span>
                      <span className={`inline-block mt-1 text-xs font-semibold px-3 py-1 rounded-full ${getBeltColor(a.faixa)}`}>
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
            <div className="glass-card">
              <h3 className="font-bold text-base tracking-tight mb-4 flex items-center gap-1.5">
                <GraduationIcon className="w-4 h-4 text-[var(--gold)]" /> {t("regrasGraduacao")}
              </h3>
              {graduacoes.length === 0 ? (
                <div className="empty-premium">
                  <div className="empty-premium-icon">
                    <GraduationIcon className="w-6 h-6 text-[var(--gold)]" />
                  </div>
                  <div className="empty-premium-title">{t("nenhumaRegra")}</div>
                  <div className="empty-premium-desc">{t("descEmptyGraduacoes")}</div>
                </div>
              ) : (
                <div className="grid-modern">
                  {graduacoes.map((g) => (
                    <div key={g.faixa} className="glass-card">
                      <div className="font-bold text-base">{getBeltEmoji(g.faixa)} {g.faixa}</div>
                      <div className="space-y-1 mt-2">
                        <div className="text-sm text-[var(--white-muted)]">{g.graus} graus · {g.aulasPorGrau} aulas/grau</div>
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
              <div className="glass-card">
                <h3 className="font-bold text-base tracking-tight mb-3 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-[var(--gold)]" /> Funil de Prospecção
                </h3>
                {!prospectStats ? (
                  <p className="text-sm text-[var(--white-muted)] text-center py-4">Carregando...</p>
                ) : (
                  <>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="stat-card">
                        <div className="text-2xl font-extrabold text-[var(--gold)]"><AnimatedCounter value={prospectStats.stats.total} /></div>
                        <div className="text-[10px] text-[var(--white-muted)] uppercase">Total</div>
                      </div>
                      <div className="stat-card">
                        <div className="text-2xl font-extrabold text-emerald-500"><AnimatedCounter value={prospectStats.stats.usados} /></div>
                        <div className="text-[10px] text-[var(--white-muted)] uppercase">Convertidos</div>
                      </div>
                      <div className="stat-card">
                        <div className="text-2xl font-extrabold text-yellow-500"><AnimatedCounter value={prospectStats.stats.pendentes} /></div>
                        <div className="text-[10px] text-[var(--white-muted)] uppercase">Pendentes</div>
                      </div>
                      <div className="stat-card">
                        <div className="text-2xl font-extrabold text-blue-500">{prospectStats.stats.conversao}%</div>
                        <div className="text-[10px] text-[var(--white-muted)] uppercase">Conversão</div>
                      </div>
                    </div>

                    {prospectStats.porTipo.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <div className="text-xs font-semibold text-[var(--white-muted)] uppercase tracking-wide">Convites por tipo</div>
                        {prospectStats.porTipo.map((t) => (
                          <div key={t.tipo} className="flex items-center gap-3">
                            <span className="text-xs font-semibold w-20 shrink-0 capitalize">{t.tipo}</span>
                            <div className="progress-gold flex-1">
                              <div className="progress-gold-fill" style={{ width: `${(t.total / prospectStats.stats.total) * 100}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-[var(--white-muted)]">{t.total}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-[var(--white-muted)] p-3 rounded-xl bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.1)] flex items-start gap-2">
                      <Target className="w-3.5 h-3.5 text-[var(--gold)] mt-0.5 shrink-0" />
                      <span>Compartilhe o link de convite com prospects. Quando eles se cadastrarem, serão contabilizados como convertidos.</span>
                    </div>
                  </>
                )}
              </div>

              {prospectStats && prospectStats.ultimos.length > 0 && (
                <div className="glass-card">
                  <h3 className="font-bold text-base tracking-tight mb-3">Últimos Convites</h3>
                  <div className="space-y-1">
                    {prospectStats.ultimos.map((c) => (
                      <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[var(--dark-border)]/30">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${c.usado ? "bg-emerald-500" : c.expiresAt && new Date(c.expiresAt) < new Date() ? "bg-red-500" : "bg-yellow-500"}`} />
                          <span className="text-xs font-semibold capitalize">{c.tipo}</span>
                          <span className="text-[10px] text-[var(--gray)]">{c.codigo}</span>
                        </div>
                        <span className="text-[10px] text-[var(--white-muted)]">
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
              <div className="glass-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-base tracking-tight flex items-center gap-1.5">
                    <AwardIcon className="w-4 h-4 text-[var(--gold)]" /> {t("configRanking")}
                  </h3>
                </div>
                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-[var(--dark-border)]/30">
                  <div>
                    <div className="text-sm font-semibold">{t("visivelAlunos")}</div>
                    <div className="text-xs text-[var(--white-muted)]">{t("descRanking")}</div>
                  </div>
                  <button
                    onClick={toggleRanking}
                    disabled={toggling}
                    className={`relative w-12 h-7 rounded-full transition-all ${rankingVisivel ? "bg-emerald-600" : "bg-[var(--dark-border)]"}`}
                  >
                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all ${rankingVisivel ? "left-5.5" : "left-0.5"}`} />
                  </button>
                </div>
                <div className="mt-3 text-xs text-[var(--white-muted)] p-3 rounded-xl bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.1)] flex items-start gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-[var(--gold)] mt-0.5 shrink-0" />
                  <span>{t("infoRanking")}</span>
                </div>
              </div>
            </div>
          )}

          {/* Convites */}
          <ConviteSection tipo="professor" />
          <ConviteSection tipo="aluno" />
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

"use client"

import { useState } from "react"
import { Calendar, Flame, Medal, Share2, BarChart3, Target, ArrowUpRight, Users } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/shell"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { PageTransition } from "@/components/ui/page-transition"
import { ProgressRing } from "./progress-ring"
import { MestreDoMesCard } from "@/components/gamification/mestre-do-mes-card"
import { DailyMissions } from "@/components/gamification/daily-missions"
import { MetaSemanalCard } from "@/components/gamification/meta-semanal-card"
import { Search } from "lucide-react"
import { useT } from "@/lib/use-t"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"
import { useRouter } from "next/navigation"

type Props = {
  aluno: {
    id: string
    nome: string
    faixa: string
    grau: number
    totalAulas: number
    dataInicio: string
    academia: string
  }
  graduacao: {
    aulasPorGrau: number
    aulasProxFx: number | null
    graus: number
  } | null
  ultimasPresencas: {
    id: string
    data: string
    horario: string
    status: string
    turma: string
  }[]
  conquistas: {
    id: string
    nome: string
    icone: string
    iconeBloqueado: string
    descricao: string
    tipo: string
    categoria: string
    condicao: number
    nivel: number
    nivelLabel: string
    raridade: string
    progressoMax: number
    desbloqueada: boolean
  }[]
  streak: number
}

export function StudentDashboardClient({ aluno, graduacao, ultimasPresencas, conquistas, streak }: Props) {
  const t = useT("aluno.dashboard")
  const router = useRouter()
  const [tab, setTab] = useState<"geral" | "jornada" | "presencas">("geral")

  const { nome, faixa, grau, totalAulas } = aluno

  const steps = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]
  const currentStep = steps.indexOf(faixa)
  const maxGraus = graduacao?.graus || 5
  const progressoGrau = (grau + 1) / maxGraus
  const aulasEsteMes = ultimasPresencas.filter(p => {
    const m = new Date(p.data).getMonth()
    return m === new Date().getMonth()
  }).length

  const presencasRecentes = ultimasPresencas.slice(0, 14).reverse()

  const quickActions = [
    { label: "Treinos", icon: Calendar, href: "/dashboard/aluno/treinos", color: "from-blue-600/20 to-blue-600/5", border: "border-blue-500/20" },
    { label: "Turmas", icon: Users, href: "/dashboard/aluno/turmas", color: "from-emerald-600/20 to-emerald-600/5", border: "border-emerald-500/20" },
    { label: "Progresso", icon: Target, href: "/dashboard/aluno/progresso", color: "from-purple-600/20 to-purple-600/5", border: "border-purple-500/20" },
    { label: "Ranking", icon: Medal, href: "/dashboard/aluno/ranking", color: "from-yellow-600/20 to-yellow-600/5", border: "border-yellow-500/20" },
  ]

  return (
    <DashboardShell role="aluno">
      <PageTransition>
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Tech Hero */}
          <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-[rgba(201,168,76,0.08)] via-[rgba(10,10,10,0.8)] to-[rgba(10,10,10,0.9)] p-6">
            <div className="absolute top-[-60px] right-[-60px] w-40 h-40 bg-[var(--gold)]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-[-40px] left-[-40px] w-32 h-32 bg-[var(--gold)]/3 rounded-full blur-3xl" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--gold)]">Atleta</span>
                <h1 className="text-2xl font-black tracking-tight">{nome}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${getBeltColor(faixa)}`}>
                    {getBeltEmoji(faixa)} {faixa}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">{'★'.repeat(grau + 1)}</span>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-3 py-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span className="font-semibold">{streak}</span>
                <span className="text-emerald-400/60">dias seguidos</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="tech-stat">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-4 h-4 text-[rgba(255,255,255,0.25)]" />
                <span className="live-dot" />
              </div>
              <div className="tech-stat-value"><AnimatedCounter value={aulasEsteMes} /></div>
              <div className="tech-stat-label">{t("aulasEsteMes")}</div>
            </div>
            <div className="tech-stat">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-4 h-4 text-[rgba(255,255,255,0.25)]" />
                <span className={`w-1.5 h-1.5 rounded-full ${streak > 0 ? "bg-emerald-500" : "bg-gray-500"} inline-block`} />
              </div>
              <div className="tech-stat-value"><AnimatedCounter value={totalAulas} /></div>
              <div className="tech-stat-label">{t("totalAulas")}</div>
            </div>
            <div className="tech-stat">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-4 h-4 text-[rgba(255,255,255,0.25)]" />
                <span className={`w-1.5 h-1.5 rounded-full ${streak >= 3 ? "bg-orange-500" : streak > 0 ? "bg-emerald-500" : "bg-gray-500"} inline-block`} />
              </div>
              <div className="tech-stat-value"><AnimatedCounter value={streak} /></div>
              <div className="tech-stat-label">{t("streak")}</div>
            </div>
            <div className="tech-stat">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-4 h-4 text-[rgba(255,255,255,0.25)]" />
                <span className="live-dot" />
              </div>
              <div className="tech-stat-value">{Math.round((aulasEsteMes / Math.max(8, 1)) * 100)}%</div>
              <div className="tech-stat-label">{t("meta")}</div>
            </div>
          </div>

          {/* Streak mobile */}
          <div className="flex sm:hidden items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-3 py-2 justify-center">
            <Flame className="w-3.5 h-3.5" />
            <span className="font-semibold">{streak}</span>
            <span className="text-emerald-400/60">dias seguidos</span>
          </div>

          {/* Progress Ring + Next Belt */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="tech-card p-5 flex items-center gap-5">
              <ProgressRing progress={progressoGrau * 100} size={80} strokeWidth={6} />
              <div>
                <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">{t("progressoFaixa")}</div>
                <div className="font-black text-xl">{`${getBeltEmoji(faixa)} ${faixa}`}</div>
                <div className="text-sm text-[var(--text-secondary)]">{grau + 1}/{maxGraus} graus</div>
              </div>
            </div>
            <div className="tech-card p-5">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">{t("proximaFaixa")}</div>
              {graduacao?.aulasProxFx !== null && graduacao?.aulasProxFx !== undefined ? (
                <>
                  <div className="font-black text-xl">
                    {getBeltEmoji(steps[Math.min(currentStep + 1, steps.length - 1)])} {steps[Math.min(currentStep + 1, steps.length - 1)]}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">{graduacao.aulasProxFx} {t("aulasRestantes")}</div>
                </>
              ) : (
                <div className="font-black text-xl text-[var(--gold)]">{t("topo")}</div>
              )}
            </div>
          </div>

          {/* Premium-only: Mestre do Mês + Daily Missions + Meta Semanal */}
          <div className="space-y-3">
            <MestreDoMesCard />
            <DailyMissions />
            <MetaSemanalCard />
          </div>

          {!aluno.academia && (
            <div className="tech-card p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-[var(--gold-dim)] border border-[var(--gold)]/20 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-[var(--gold)]" />
              </div>
              <h3 className="font-bold text-base">Encontre sua academia</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
                Você ainda não está vinculado a nenhuma academia. Busque e entre para uma para acompanhar suas aulas e evolução.
              </p>
              <button
                onClick={() => router.push("/dashboard/aluno/perfil")}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 mt-4 rounded-xl text-sm font-bold bg-[var(--gold)] text-black hover:shadow-lg hover:shadow-[var(--gold)]/20 transition-all active:scale-95"
              >
                Buscar academia
              </button>
            </div>
          )}

          {aluno.academia && (
            <div className="tech-card p-5">
              <div className="section-header">{t("compartilhar")}</div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getBeltEmoji(faixa)}</span>
                  <span className="font-bold">{faixa} · {'★'.repeat(grau + 1)}</span>
                  <span className="text-xs text-[var(--text-secondary)]">{totalAulas} aulas</span>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--gold)]/30 text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-all">
                  <Share2 className="w-3.5 h-3.5" /> {t("compartilharBtn")}
                </button>
              </div>
            </div>
          )}

          {/* Presenças Recentes */}
          <div className="tech-card p-5">
            <div className="section-header">{t("presencasRecentes")}</div>
            {presencasRecentes.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-1" />
                <p className="text-sm text-[var(--text-secondary)]">{t("nenhumaPresenca")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
                {presencasRecentes.map((p, i) => {
                  const d = new Date(p.data)
                  const confirmed = p.status === "confirmed"
                  return (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <span className="text-[8px] text-[var(--text-muted)]">{d.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 2)}</span>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                        confirmed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-[rgba(255,255,255,0.03)] text-[var(--text-muted)] border border-transparent"
                      }`}>
                        {d.getDate()}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </DashboardShell>
  )
}


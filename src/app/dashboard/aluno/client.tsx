"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Flame, Medal, Share2, BarChart3, Target, ArrowUpRight, Users, UserPlus, Zap, Trophy, Sword, ChevronRight, TrendingUp } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/shell"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { PageTransition } from "@/components/ui/page-transition"
import { ProgressRing } from "./progress-ring"
import { MestreDoMesCard } from "@/components/gamification/mestre-do-mes-card"
import { DailyMissions } from "@/components/gamification/daily-missions"
import { GamificationGuide } from "@/components/gamification/gamification-guide"
import { MetaSemanalCard } from "@/components/gamification/meta-semanal-card"
import { Search } from "lucide-react"
import { ConviteSection } from "@/components/convites/convite-section"
import { useT } from "@/lib/use-t"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { triggerOssTransition } from "@/components/ui/oss-transition"
import { getNivelInfo } from "@/lib/disciplina"
import { AttendanceHeatmap } from "@/components/ui/attendance-heatmap"

type Props = {
  aluno: {
    id: string
    nome: string
    faixa: string
    grau: number
    totalAulas: number
    pontos: number
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
  nivelDisciplina: string | null
}

function getLevelInfo(totalAulas: number) {
  const thresholds = [0, 50, 150, 300, 500, 800, 1200]
  const titles = ["Iniciante", "Regular", "Dedicado", "Experiente", "Avançado", "Elite", "Master"]
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (totalAulas >= thresholds[i]) {
      const current = totalAulas - thresholds[i]
      const next = thresholds[i + 1] ? thresholds[i + 1] - thresholds[i] : thresholds[i] - thresholds[i - 1]
      return { level: i + 1, current, next, progress: Math.min((current / next) * 100, 100), title: titles[i] }
    }
  }
  return { level: 1, current: 0, next: 50, progress: 0, title: "Iniciante" }
}

const allBelts = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]
const beltColors = ["#e5e5e5", "#2563eb", "#9333ea", "#92400e", "#222"]

export function StudentDashboardClient({ aluno, graduacao, ultimasPresencas, conquistas, streak, nivelDisciplina }: Props) {
  const t = useT("aluno.dashboard")
  const ta = useT("alunoDashboard")
  const router = useRouter()

  const { nome, faixa, grau, totalAulas, pontos } = aluno
  const levelInfo = getLevelInfo(totalAulas)

  const steps = allBelts
  const currentStep = steps.indexOf(faixa)
  const maxGraus = graduacao?.graus || 5
  const progressoGrau = (grau + 1) / maxGraus
  const aulasEsteMes = ultimasPresencas.filter(p => {
    const m = new Date(p.data).getMonth()
    return m === new Date().getMonth()
  }).length

  const presencasRecentes = useMemo(() => {
    return ultimasPresencas.slice(0, 14).reverse()
  }, [ultimasPresencas])

  const conquistasUnlocked = conquistas.filter(c => c.desbloqueada).length

  const quickActions = [
    { label: ta("treinos"), icon: Calendar, href: "/dashboard/aluno/treino" },
    { label: ta("evolucao"), icon: Target, href: "/dashboard/aluno/evolucao" },
    { label: ta("conquistas"), icon: Medal, href: "/dashboard/aluno/conquistas" },
    { label: ta("ranking"), icon: TrendingUp, href: "/dashboard/aluno/ranking" },
    { label: ta("convidar"), icon: UserPlus, href: "#convites" },
  ]

  const [section, setSection] = useState<"jornada" | "atividade" | "social">("jornada")

  return (
    <DashboardShell role="aluno">
      <PageTransition>
        <div className="max-w-4xl mx-auto">

          {/* HERO — compact editorial header */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(212,168,71,0.03)] to-transparent rounded-2xl" />
            <div className="relative flex items-center justify-between gap-4 p-5 md:p-6">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--gold)] to-amber-600 flex items-center justify-center text-black font-black text-xl shrink-0 shadow-lg shadow-[var(--gold)]/20">
                  {nome.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl md:text-2xl font-black tracking-tight truncate">{nome}</h1>
                    {getNivelInfo(nivelDisciplina) && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(212,168,71,0.1)", color: "var(--gold)" }}>
                        {getNivelInfo(nivelDisciplina)!.icone} {getNivelInfo(nivelDisciplina)!.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 mt-1">
                    <span className={`inline-flex items-center gap-1 text-[0.625rem] font-bold px-2.5 py-0.5 rounded-full ${getBeltColor(faixa)}`}>
                      {getBeltEmoji(faixa)} {faixa} {grau > 0 && '★'.repeat(grau + 1)}
                    </span>
                    {aluno.academia && (
                      <span className="text-[0.625rem] text-[var(--text-muted)]">{aluno.academia}</span>
                    )}
                    <span className="text-[0.625rem] text-[var(--text-muted)]">· Lv.{levelInfo.level}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-2xl font-black" style={{ color: streak >= 3 ? "#f97316" : "var(--gold)" }}>{streak}</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">streak</div>
                </div>
              </div>
            </div>
          </div>

          {/* STATS ROW — 4 compact visual cards */}
          <div className="grid grid-cols-4 gap-2.5 mb-6 enter-stagger">
            <div className="stat-glass px-3 py-3.5 text-center" title="Aulas com check-in confirmado neste mês">
              <div className="text-lg font-black" style={{ color: "#60a5fa" }}><AnimatedCounter value={aulasEsteMes} /></div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-0.5">{t("aulasEsteMes")}</div>
            </div>
            <div className="stat-glass px-3 py-3.5 text-center" title="Total de aulas desde o primeiro check-in">
              <div className="text-lg font-black" style={{ color: "#a855f7" }}><AnimatedCounter value={totalAulas} /></div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-0.5">{t("totalAulas")}</div>
            </div>
            <div className="stat-glass px-3 py-3.5 text-center" title="Dias consecutivos com check-in. Não perca sua sequência!">
              <div className="text-lg font-black" style={{ color: streak >= 3 ? "#f97316" : "#22c55e" }}><AnimatedCounter value={streak} /></div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-0.5">{t("streak")}</div>
            </div>
            <div className="stat-glass px-3 py-3.5 text-center" title="Percentual da meta semanal de 8 aulas">
              <div className="text-lg font-black" style={{ color: "var(--gold)" }}>{Math.round((aulasEsteMes / Math.max(8, 1)) * 100)}%</div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-0.5">{t("meta")}</div>
            </div>
          </div>

          {/* XP BAR */}
          <div className="mb-6" title="Cada check-in vale XP. Treine mais para subir de nível e desbloquear conquistas!">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--gold)] to-amber-600 flex items-center justify-center text-black text-[10px] font-black">{levelInfo.level}</div>
                <span className="text-xs font-bold">{levelInfo.title}</span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)]">{levelInfo.current.toLocaleString()} / {levelInfo.next.toLocaleString()} XP</span>
            </div>
            <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-amber-500 transition-all duration-500" style={{ width: `${levelInfo.progress}%` }} />
            </div>
          </div>

          {/* SECTION TABS */}
          <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
            {[
              { key: "jornada", label: "Jornada", icon: "🥋" },
              { key: "atividade", label: "Atividade", icon: "🔥" },
              { key: "social", label: "Social", icon: "👥" },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setSection(tab.key as typeof section)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  section === tab.key
                    ? "bg-[rgba(212,168,71,0.12)] text-[var(--gold)] shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* TAB: JORNADA */}
          <AnimatePresence mode="wait">
          {section === "jornada" && (
            <motion.div key="jornada" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-4">
              {/* Belt Journey — main visual feature */}
              <div className="glass-card-accent p-5" style={{"--accent-color": "var(--belt-coral)"} as React.CSSProperties}>
                <span className="section-header mb-4 block">{t("jornadaFaixas")}</span>
                <div className="flex items-center justify-center gap-1 mb-5">
                  {steps.map((s, i) => {
                    const isReached = i < currentStep
                    const isActive = i === currentStep
                    const isLast = i === steps.length - 1
                    return (
                      <div key={s} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className={`belt-node ${isReached ? "reached" : ""} ${isActive ? "active" : ""} ${!isReached && !isActive ? "upcoming" : ""}`}
                            style={isReached && !isActive ? { borderColor: `${beltColors[i]}66`, background: `${beltColors[i]}12`, color: beltColors[i] } : {}}>
                            {getBeltEmoji(s)}
                          </div>
                          <span className="belt-label">{s}</span>
                        </div>
                        {!isLast && <div className={`belt-connector ${i < currentStep ? "filled" : ""}`} />}
                      </div>
                    )
                  })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <ProgressRing progress={progressoGrau * 100} size={64} strokeWidth={6} />
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{t("progressoFaixa")}</div>
                      <div className="font-black text-lg mt-0.5 truncate">{getBeltEmoji(faixa)} {faixa}</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">{grau + 1}/{maxGraus} graus</div>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl flex flex-col justify-center" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{t("proximaFaixa")}</div>
                    <div className="font-black text-lg mt-1">
                      {graduacao?.aulasProxFx ? (
                        <span>{getBeltEmoji(steps[Math.min(currentStep + 1, steps.length - 1)])} {steps[Math.min(currentStep + 1, steps.length - 1)]}</span>
                      ) : (
                        <span style={{ color: "var(--gold)" }}>{t("topo")}</span>
                      )}
                    </div>
                    {graduacao?.aulasProxFx && (
                      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{graduacao.aulasProxFx} {t("aulasRestantes")}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Missions + Mestre do Mês */}
              <MestreDoMesCard />
              <MetaSemanalCard />
              <DailyMissions />

              {/* XP Level detail */}
              <div className="glass-card-accent-left p-5" style={{"--accent-color": "var(--belt-branca)"} as React.CSSProperties}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-amber-700 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-[var(--gold)]/20">
                    {levelInfo.level}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{levelInfo.title}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Lv.{levelInfo.level}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-[var(--text-secondary)]">{totalAulas} aulas</span>
                      <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                      <span className="text-[var(--text-secondary)]">{levelInfo.next.toLocaleString()} XP p/ próximo</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-amber-500 transition-all duration-500" style={{ width: `${levelInfo.progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: ATIVIDADE */}
          {section === "atividade" && (
            <motion.div key="atividade" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-4">
              {/* Heatmap */}
              <div className="glass-card-accent p-5" style={{"--accent-color": "var(--belt-azul)"} as React.CSSProperties}>
                <div className="section-header mb-3">{t("presencasRecentes")}</div>
                {ultimasPresencas.length === 0 ? (
                  <div className="text-center py-6">
                    <Calendar className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-1" />
                    <p className="text-xs text-[var(--text-secondary)]">{t("nenhumaPresenca")}</p>
                  </div>
                ) : (
                  <AttendanceHeatmap presencas={ultimasPresencas} />
                )}
              </div>

              {/* Conquistas preview */}
              {conquistas.length > 0 && (
                <div className="glass-card-accent-left p-5" style={{"--accent-color": "var(--belt-roxa)"} as React.CSSProperties}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="section-header mb-0">{ta("conquistas")}</span>
                    <button onClick={() => router.push("/dashboard/aluno/conquistas")} className="text-[9px] font-bold text-[var(--gold)] flex items-center gap-0.5 hover:underline">
                      {ta("verTodas")} <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Trophy className="w-3.5 h-3.5 text-[var(--gold)]" />
                    <span className="text-xs text-[var(--text-secondary)]">{conquistasUnlocked}/{conquistas.length} {ta("desbloqueadas")}</span>
                  </div>
                  <div className="achievement-grid">
                    {conquistas.slice(0, 12).map((c) => (
                      <div key={c.id} className={`achievement-badge ${c.desbloqueada ? "unlocked" : "locked"}`} title={c.nome}>
                        {c.desbloqueada ? c.icone : c.iconeBloqueado}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="grid grid-cols-5 gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button key={action.label} onClick={async () => { if (action.href.startsWith("#")) return; await triggerOssTransition(); router.push(action.href) }} className="quick-action">
                      <Icon className="quick-action-icon" />
                      <span className="quick-action-label">{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* TAB: SOCIAL */}
          {section === "social" && (
            <motion.div key="social" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-4">
              {/* SEM ACADEMIA */}
              {!aluno.academia && (
                <div className="glass-card-accent p-6 text-center" style={{"--accent-color": "var(--belt-vermelha)"} as React.CSSProperties}>
                  <div className="w-12 h-12 rounded-xl bg-[rgba(212,168,71,0.06)] border border-[rgba(212,168,71,0.08)] flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-[var(--gold)]" />
                  </div>
                  <h3 className="font-bold text-base">{ta("encontreAcademia")}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">{ta("semVinculoDesc")}</p>
                  <button onClick={() => router.push("/dashboard/aluno/perfil")}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 mt-4 rounded-xl text-sm font-bold bg-[var(--gold)] text-black hover:shadow-lg hover:shadow-[var(--gold)]/20 transition-all active:scale-95 animate-pulse-gold">
                    {ta("buscarAcademia")}
                  </button>
                </div>
              )}

              {/* Share card */}
              {aluno.academia && (
                <div className="glass-card-accent-left p-5" style={{"--accent-color": "var(--belt-coral)"} as React.CSSProperties}>
                  <span className="section-header">{t("compartilhar")}</span>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gold)]/10 to-transparent border border-[rgba(212,168,71,0.08)] flex items-center justify-center">
                        <span className="text-lg">{getBeltEmoji(faixa)}</span>
                      </div>
                      <div>
                        <div className="font-bold text-sm">{faixa} · {'★'.repeat(grau + 1)}</div>
                        <div className="text-[10px] text-[var(--text-secondary)]">{totalAulas} {ta("aulasNv")}{levelInfo.level}</div>
                      </div>
                    </div>
                    <button className="flex items-center gap-1.5 text-[10px] font-bold px-3.5 py-2 rounded-lg border border-[rgba(212,168,71,0.15)] text-[var(--gold)] hover:bg-[rgba(212,168,71,0.06)] transition-all">
                      <Share2 className="w-3.5 h-3.5" /> {t("compartilharBtn")}
                    </button>
                  </div>
                </div>
              )}

              {/* Convites */}
              <div id="convites" className="space-y-4">
                <span className="section-header">{ta("convidarOssTrack")}</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <ConviteSection tipo="aluno" />
                  <ConviteSection tipo="professor" />
                  <ConviteSection tipo="academia" />
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>

        </div>
      </PageTransition>
      <GamificationGuide />
    </DashboardShell>
  )
}

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Medal, Target, TrendingUp, UserPlus, Share2, Trophy, ChevronRight, CheckCircle, Zap, Clock } from "lucide-react"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"
import { getNivelInfo } from "@/lib/disciplina"
import { ProgressRing } from "@/app/dashboard/aluno/progress-ring"
import { AttendanceHeatmap } from "@/components/ui/attendance-heatmap"
import { ConviteSection } from "@/components/convites/convite-section"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { CrownIcon } from "@/components/ui/icons"
import { useT } from "@/lib/use-t"

const faixa = "Azul"
const grau = 2
const maxGraus = 4
const totalAulas = 42
const aulasEsteMes = 12
const streakVal = 12
const pontosVal = 2450
const nome = "Rafael Oliveira"
const academiaNome = "Academia Modelo"
const nivelDisciplina = "guerreiro"

const gamificationLevels = [
  { pontos: 0, titleKey: "gamificacao.1" }, { pontos: 500, titleKey: "gamificacao.2" }, { pontos: 1500, titleKey: "gamificacao.3" },
  { pontos: 3000, titleKey: "gamificacao.4" }, { pontos: 5000, titleKey: "gamificacao.5" }, { pontos: 7500, titleKey: "gamificacao.6" },
  { pontos: 10500, titleKey: "gamificacao.7" }, { pontos: 14000, titleKey: "gamificacao.8" }, { pontos: 18000, titleKey: "gamificacao.9" },
  { pontos: 22500, titleKey: "gamificacao.10" }, { pontos: 28000, titleKey: "gamificacao.11" }, { pontos: 35000, titleKey: "gamificacao.12" },
]

function getGamificationLevel(pontos: number) {
  for (let i = gamificationLevels.length - 1; i >= 0; i--) {
    if (pontos >= gamificationLevels[i].pontos) {
      const current = pontos - gamificationLevels[i].pontos
      const nextLevel = gamificationLevels[i + 1]
      const nextThreshold = nextLevel ? nextLevel.pontos - gamificationLevels[i].pontos : Infinity
      return { level: i + 1, current, next: nextThreshold, progress: Math.min((current / nextThreshold) * 100, 100), titleKey: gamificationLevels[i].titleKey }
    }
  }
  return { level: 1, current: 0, next: 500, progress: 0, titleKey: "gamificacao.1" }
}

function getLevelInfo(total: number) {
  const thresholds = [0, 50, 150, 300, 500, 800, 1200]
  const titleKeys = ["aulas.1", "aulas.2", "aulas.3", "aulas.4", "aulas.5", "aulas.6", "aulas.7"]
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (total >= thresholds[i]) {
      const current = total - thresholds[i]
      const next = thresholds[i + 1] ? thresholds[i + 1] - thresholds[i] : thresholds[i] - thresholds[i - 1]
      return { level: i + 1, current, next, progress: Math.min((current / next) * 100, 100), titleKey: titleKeys[i] }
    }
  }
  return { level: 1, current: 0, next: 50, progress: 0, titleKey: "aulas.1" }
}

const allBelts = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]
const beltColors = ["#e5e5e5", "#2563eb", "#9333ea", "#92400e", "#222"]
const currentStep = allBelts.indexOf(faixa)
const progressoGrau = (grau + 1) / maxGraus

const quickActions = [
  { labelKey: "acaoTreinos", icon: Calendar, href: "/dashboard/aluno/treino" },
  { labelKey: "acaoEvolucao", icon: Target, href: "/dashboard/aluno/evolucao" },
  { labelKey: "acaoConquistas", icon: Medal, href: "/dashboard/aluno/conquistas" },
  { labelKey: "acaoRanking", icon: TrendingUp, href: "/dashboard/aluno/ranking" },
  { labelKey: "acaoHoras", icon: Clock, href: "/dashboard/aluno/horas" },
  { labelKey: "acaoConvidar", icon: UserPlus, href: "#convites" },
]

const mockPresencas = Array.from({ length: 60 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * 120))
  return {
    id: String(i),
    data: d.toISOString().split("T")[0],
    horario: "18:30",
    status: Math.random() > 0.25 ? "confirmed" : "missed",
    turma: "Jiu-Jitsu",
  }
})

const mockConquistas = [
  { id: "1", nome: "Primeiro Check-in", icone: "🥋", iconeBloqueado: "🔒", descricao: "", tipo: "", categoria: "", condicao: 0, nivel: 1, nivelLabel: "", raridade: "", progressoMax: 0, desbloqueada: true },
  { id: "2", nome: "Streak de Fogo", icone: "🔥", iconeBloqueado: "🔒", descricao: "", tipo: "", categoria: "", condicao: 0, nivel: 1, nivelLabel: "", raridade: "", progressoMax: 0, desbloqueada: true },
  { id: "3", nome: "Dedicação", icone: "💪", iconeBloqueado: "🔒", descricao: "", tipo: "", categoria: "", condicao: 0, nivel: 1, nivelLabel: "", raridade: "", progressoMax: 0, desbloqueada: true },
  { id: "4", nome: "Estrela", icone: "⭐", iconeBloqueado: "🔒", descricao: "", tipo: "", categoria: "", condicao: 0, nivel: 1, nivelLabel: "", raridade: "", progressoMax: 0, desbloqueada: true },
  { id: "5", nome: "Força", icone: "🌟", iconeBloqueado: "🔒", descricao: "", tipo: "", categoria: "", condicao: 0, nivel: 1, nivelLabel: "", raridade: "", progressoMax: 0, desbloqueada: true },
  { id: "6", nome: "Campeão", icone: "🏆", iconeBloqueado: "🔒", descricao: "", tipo: "", categoria: "", condicao: 0, nivel: 1, nivelLabel: "", raridade: "", progressoMax: 0, desbloqueada: false },
  { id: "7", nome: "Raio", icone: "⚡", iconeBloqueado: "🔒", descricao: "", tipo: "", categoria: "", condicao: 0, nivel: 1, nivelLabel: "", raridade: "", progressoMax: 0, desbloqueada: false },
  { id: "8", nome: "Mestre", icone: "👑", iconeBloqueado: "🔒", descricao: "", tipo: "", categoria: "", condicao: 0, nivel: 1, nivelLabel: "", raridade: "", progressoMax: 0, desbloqueada: false },
  { id: "9", nome: "Guerreiro", icone: "⚔️", iconeBloqueado: "🔒", descricao: "", tipo: "", categoria: "", condicao: 0, nivel: 1, nivelLabel: "", raridade: "", progressoMax: 0, desbloqueada: false },
  { id: "10", nome: "Lenda", icone: "🌊", iconeBloqueado: "🔒", descricao: "", tipo: "", categoria: "", condicao: 0, nivel: 1, nivelLabel: "", raridade: "", progressoMax: 0, desbloqueada: false },
  { id: "11", nome: "Fênix", icone: "🦅", iconeBloqueado: "🔒", descricao: "", tipo: "", categoria: "", condicao: 0, nivel: 1, nivelLabel: "", raridade: "", progressoMax: 0, desbloqueada: false },
  { id: "12", nome: "Kami", icone: "☯️", iconeBloqueado: "🔒", descricao: "", tipo: "", categoria: "", condicao: 0, nivel: 1, nivelLabel: "", raridade: "", progressoMax: 0, desbloqueada: false },
]

const conquistasUnlocked = mockConquistas.filter(c => c.desbloqueada).length

export function ScreenshotDemo() {
  const t = useT("pagDemo")
  const tMeses = useT("meses")
  const [section, setSection] = useState<"jornada" | "atividade" | "social">("jornada")

  const gl = getGamificationLevel(pontosVal)
  const levelInfo = getLevelInfo(totalAulas)
  const proximoTitulo = gamificationLevels[gl.level]?.titleKey ?? "nivelProximo"

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] text-white overflow-hidden">

      {/* HERO */}
      <div className="relative mb-6 px-4 pt-4">
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(212,168,71,0.03)] to-transparent rounded-2xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--gold)] to-amber-600 flex items-center justify-center text-black font-black text-xl shrink-0 shadow-lg shadow-[var(--gold)]/20">
              {nome.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl md:text-2xl font-black tracking-tight truncate">{nome}</span>
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
                <span className="text-[0.625rem] text-[var(--text-muted)]">{academiaNome}</span>
                <span className="text-[0.625rem] text-[var(--text-muted)]">· {t("nivelLv").replace("{n}", String(levelInfo.level))}</span>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-black" style={{ color: "#f97316" }}>{streakVal}</div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{t("streak")}</div>
          </div>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-4 gap-2.5 px-4 mb-6 enter-stagger">
        <div className="stat-glass px-3 py-3.5 text-center">
          <div className="text-lg font-black" style={{ color: "#60a5fa" }}><AnimatedCounter value={aulasEsteMes} /></div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-0.5">{t("statAulasMes")}</div>
        </div>
        <div className="stat-glass px-3 py-3.5 text-center">
          <div className="text-lg font-black" style={{ color: "#a855f7" }}><AnimatedCounter value={totalAulas} /></div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-0.5">{t("statTotal")}</div>
        </div>
        <div className="stat-glass px-3 py-3.5 text-center">
          <div className="text-lg font-black" style={{ color: streakVal >= 3 ? "#f97316" : "#22c55e" }}><AnimatedCounter value={streakVal} /></div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-0.5">{t("statStreak")}</div>
        </div>
        <div className="stat-glass px-3 py-3.5 text-center">
          <div className="text-lg font-black" style={{ color: "var(--gold)" }}>{Math.round((aulasEsteMes / Math.max(8, 1)) * 100)}%</div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-0.5">{t("statMeta")}</div>
        </div>
      </div>

      {/* XP BAR */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--gold)] to-amber-600 flex items-center justify-center text-black text-[10px] font-black">{gl.level}</div>
            <span className="text-xs font-bold">{t(gl.titleKey)}</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">
            {t("xpBarra").replace("{atual}", pontosVal.toLocaleString()).replace("{faltam}", gl.next.toLocaleString())}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-amber-500 transition-all duration-500" style={{ width: `${gl.progress}%` }} />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-[var(--text-muted)]">
            {gl.next === Infinity
              ? t("nivelMaximo")
              : t("faltam").replace("{n}", String(Math.ceil((gl.next - gl.current) / 50))).replace("{nivel}", t(proximoTitulo))}
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {t("aulasGrau").replace("{aulas}", "8").replace("{proxFaixa}", "200")}
          </span>
        </div>
      </div>

      {/* TABS */}
      <div className="mx-4 mb-5 flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
        {[
          { key: "jornada" as const, labelKey: "tabJornada", icon: "🥋" },
          { key: "atividade" as const, labelKey: "tabAtividade", icon: "🔥" },
          { key: "social" as const, labelKey: "tabSocial", icon: "👥" },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setSection(tab.key)}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
              section === tab.key
                ? "bg-[rgba(212,168,71,0.12)] text-[var(--gold)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}>
            {tab.icon} {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-auto px-4 pb-5 min-h-0">
        <AnimatePresence mode="wait">
          {section === "jornada" && (
            <motion.div key="jornada" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-4">
              {/* Belt Journey */}
              <div className="glass-card-accent p-5" style={{"--accent-color": "var(--belt-coral)"} as React.CSSProperties}>
                <span className="section-header mb-4 block">{t("jornadaFaixas")}</span>
                <div className="flex items-center justify-center gap-1 mb-5">
                  {allBelts.map((s, i) => {
                    const isReached = i < currentStep
                    const isActive = i === currentStep
                    const isLast = i === allBelts.length - 1
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
                      <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{t("progresso")}</div>
                      <div className="font-black text-lg mt-0.5 truncate">{getBeltEmoji(faixa)} {faixa}</div>
                      <div className="text-[11px] text-[var(--text-secondary)]">{t("grausProgresso").replace("{atual}", String(grau + 1)).replace("{total}", String(maxGraus))}</div>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl flex flex-col justify-center" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{t("proximaFaixa")}</div>
                    <div className="font-black text-lg mt-1">{getBeltEmoji("Roxa")} Roxa</div>
                    <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">{t("aulasRestantes").replace("{n}", "200")}</div>
                  </div>
                </div>
              </div>

              {/* Mestre do Mês — card (mesma classe do componente real) */}
              <div className="card text-center relative overflow-hidden">
                <div className="absolute top-[-30px] right-[-30px] w-32 h-32 bg-[var(--gold)]/5 rounded-full blur-3xl" />
                <div className="relative p-5">
                  <CrownIcon className="w-8 h-8 mx-auto mb-1 text-[var(--gold)]" />
                  <h3 className="font-bold text-base tracking-tight">{t("mestreDoMes")}</h3>
                  <p className="text-2xl font-extrabold text-[var(--gold)] mt-2">Carlos Silva</p>
                  <p className="text-xs text-[var(--text-secondary)]">{t("mestreSub").replace("{faixa}", "Roxa").replace("{aulas}", "18")}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">{t("mestrePeriodo").replace("{mes}", tMeses("6")).replace("{ano}", "2026")}</p>
                  <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                    <button className="inline-flex items-center gap-1 text-xs text-[var(--gold)] font-semibold hover:underline">
                      {t("verRanking")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Progresso Semanal — glass-card (mesma estrutura do componente real) */}
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[var(--gold)]" />
                    <span className="section-header mb-0">{t("progressoSemanal")}</span>
                  </div>
                  <span className="badge" style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold)" }}>{t("semanal")}</span>
                </div>
                <div className="relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)]">
                      <Target className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{t("semanalAulas").replace("{feitas}", "4").replace("{total}", "5")}</span>
                      </div>
                      <div className="mt-2 progress">
                        <div className="progress-gold-fill" style={{ width: "80%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Missions — card (mesma classe do componente real) */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[var(--gold)]" />
                    <span className="section-header mb-0">{t("missoesDiarias")}</span>
                  </div>
                  <span className="badge" style={{ background: "rgba(201,168,76,0.1)", color: "var(--gold)" }}>2/4</span>
                </div>
                <div className="space-y-2">
                  {[
                    { tituloKey: "missao1", pontos: 50, concluida: true },
                    { tituloKey: "missao2", pontos: 30, concluida: true },
                    { tituloKey: "missao3", pontos: 20, concluida: false },
                    { tituloKey: "missao4", pontos: 40, concluida: false },
                  ].map((m) => (
                    <div key={m.tituloKey}
                      className={`relative overflow-hidden rounded-xl border p-3.5 transition-all ${
                        m.concluida ? "border-emerald-500/30 bg-emerald-500/5" : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                          m.concluida ? "bg-emerald-500/20 text-emerald-400" : "bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)]"
                        }`}>
                          {m.concluida ? <CheckCircle className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`font-semibold text-sm ${m.concluida ? "text-emerald-400 line-through" : ""}`}>{t(m.tituloKey)}</span>
                            <span className="text-[10px] font-bold text-[var(--gold)]">{t("xpMissao").replace("{pontos}", String(m.pontos))}</span>
                          </div>
                          {!m.concluida && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t("missaoDesc")}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* XP Level — glass-card-accent-left (usa getLevelInfo como o real) */}
              <div className="glass-card-accent-left p-5" style={{"--accent-color": "var(--belt-branca)"} as React.CSSProperties}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-amber-700 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-[var(--gold)]/20">
                    {levelInfo.level}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{t(levelInfo.titleKey)}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{t("nivelLv").replace("{n}", String(levelInfo.level))}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-[var(--text-secondary)]">{t("totalAulas").replace("{n}", String(totalAulas))}</span>
                      <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                      <span className="text-[var(--text-secondary)]">{t("xpProximo").replace("{xp}", levelInfo.next.toLocaleString())}</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-amber-500 transition-all duration-500" style={{ width: `${levelInfo.progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Horas de Treino — banner card */}
              <div className="relative overflow-hidden rounded-2xl p-4" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.08) 50%, rgba(212,168,71,0.06) 100%)", border: "1px solid rgba(59,130,246,0.15)" }}>
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)" }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", boxShadow: "0 4px 15px rgba(59,130,246,0.25)" }}>
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-secondary)]">{t("horasTreino")}</p>
                      <p className="text-lg font-black" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t("verHoras")}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
                </div>
              </div>
            </motion.div>
          )}

          {section === "atividade" && (
            <motion.div key="atividade" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-4">
              {/* Heatmap — componente real */}
              <div className="glass-card-accent p-5" style={{"--accent-color": "var(--belt-azul)"} as React.CSSProperties}>
                <span className="section-header mb-3 block">{t("presencasRecentes")}</span>
                <AttendanceHeatmap presencas={mockPresencas} />
              </div>

              {/* Conquistas preview — mesmas classes do real */}
              <div className="glass-card-accent-left p-5" style={{"--accent-color": "var(--belt-roxa)"} as React.CSSProperties}>
                <div className="flex items-center justify-between mb-3">
                  <span className="section-header mb-0">{t("conquistas")}</span>
                  <span className="text-[9px] font-bold text-[var(--gold)] flex items-center gap-0.5">
                    {t("verTodas")} <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Trophy className="w-3.5 h-3.5 text-[var(--gold)]" />
                  <span className="text-xs text-[var(--text-secondary)]">{t("desbloqueadas").replace("{n}", String(conquistasUnlocked)).replace("{total}", String(mockConquistas.length))}</span>
                </div>
                <div className="achievement-grid">
                  {mockConquistas.map((c) => (
                    <div key={c.id} className={`achievement-badge ${c.desbloqueada ? "unlocked" : "locked"}`}>
                      {c.desbloqueada ? c.icone : c.iconeBloqueado}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions — mesmas classes do real */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button key={action.labelKey} className="quick-action">
                      <Icon className="quick-action-icon" />
                      <span className="quick-action-label">{t(action.labelKey)}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {section === "social" && (
            <motion.div key="social" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-4">
              {/* Share card — mesma estrutura do real */}
              <div className="glass-card-accent-left p-5" style={{"--accent-color": "var(--belt-coral)"} as React.CSSProperties}>
                <span className="section-header">{t("compartilharTitulo")}</span>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gold)]/10 to-transparent border border-[rgba(212,168,71,0.08)] flex items-center justify-center">
                      <span className="text-lg">{getBeltEmoji(faixa)}</span>
                    </div>
                    <div>
                      <div className="font-bold text-sm">{faixa} · {'★'.repeat(grau + 1)}</div>
                      <div className="text-[10px] text-[var(--text-secondary)]">
                        {t("totalAulas").replace("{n}", String(totalAulas))} · {t("nivelNv").replace("{n}", String(levelInfo.level))}
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 text-[10px] font-bold px-3.5 py-2 rounded-lg border border-[rgba(212,168,71,0.15)] text-[var(--gold)]">
                    <Share2 className="w-3.5 h-3.5" /> {t("compartilharAcao")}
                  </button>
                </div>
              </div>

              {/* Convites — componentes reais */}
              <div id="convites" className="space-y-4">
                <span className="section-header">{t("convideOssTrack")}</span>
                <div className="grid grid-cols-1 gap-3">
                  <ConviteSection tipo="aluno" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

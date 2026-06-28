"use client"

import { useState } from "react"
import { Flame, Target, Calendar } from "lucide-react"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"

const faixa = "Azul"
const grau = 2
const maxGraus = 4
const totalAulas = 42
const aulasEsteMes = 12
const streak = 12
const nome = "Rafael Oliveira"
const academia = "Academia Modelo"
const nivelDisciplina = "guerreiro"

const steps = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]
const currentStep = 1
const allBelts = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]
const beltColors = ["#e5e5e5", "#2563eb", "#9333ea", "#92400e", "#222"]

function getLevelInfo(t: number) {
  const thresholds = [0, 50, 150, 300, 500, 800, 1200]
  const titles = ["Iniciante", "Regular", "Dedicado", "Experiente", "Avançado", "Elite", "Master"]
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (t >= thresholds[i]) {
      const cur = t - thresholds[i]; const next = thresholds[i + 1] ? thresholds[i + 1] - thresholds[i] : thresholds[i] - thresholds[i - 1]
      return { level: i + 1, current: cur, next, progress: Math.min((cur / next) * 100, 100), title: titles[i] }
    }
  }
  return { level: 1, current: 0, next: 50, progress: 0, title: "Iniciante" }
}

const levelInfo = getLevelInfo(totalAulas)
const progressoGrau = (grau + 1) / maxGraus

function NivelTag({ nivel }: { nivel: string }) {
  const config: Record<string, { icone: string; label: string }> = {
    iniciante: { icone: "🟢", label: "Iniciante" },
    regular: { icone: "🔵", label: "Regular" },
    dedicado: { icone: "🟣", label: "Dedicado" },
    guerreiro: { icone: "⚔️", label: "Guerreiro" },
    elite: { icone: "💎", label: "Elite" },
    mestre: { icone: "👑", label: "Mestre" },
    lendario: { icone: "🔥", label: "Lendário" },
  }
  const info = config[nivel]
  if (!info) return null
  return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(212,168,71,0.1)", color: "var(--gold)" }}>{info.icone} {info.label}</span>
}

export function ScreenshotDemo() {
  const [section, setSection] = useState<"jornada" | "atividade" | "social">("jornada")

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] text-white overflow-hidden">
      {/* HERO */}
      <div className="relative flex items-center justify-between gap-4 p-5 pb-3">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--gold)] to-amber-600 flex items-center justify-center text-black font-black text-xl shrink-0 shadow-lg shadow-[var(--gold)]/20">
            {nome.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-black tracking-tight truncate">{nome}</span>
              <NivelTag nivel={nivelDisciplina} />
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <span className={`inline-flex items-center gap-1 text-[0.625rem] font-bold px-2.5 py-0.5 rounded-full ${getBeltColor(faixa)}`}>
                {getBeltEmoji(faixa)} {faixa} ★★★
              </span>
              <span className="text-[0.625rem] text-[var(--text-muted)]">{academia}</span>
              <span className="text-[0.625rem] text-[var(--text-muted)]">· Lv.{levelInfo.level}</span>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-black" style={{ color: "#f97316" }}>{streak}</div>
          <div className="text-[8px] font-bold uppercase tracking-widest text-[var(--text-muted)]">streak</div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-2 px-5 pb-3">
        {[
          { value: aulasEsteMes, label: "Aulas/mês", color: "#60a5fa" },
          { value: totalAulas, label: "Total", color: "#a855f7" },
          { value: streak, label: "Streak", color: "#f97316" },
          { value: `${Math.round((aulasEsteMes / 8) * 100)}%`, label: "Meta", color: "var(--gold)" },
        ].map((s) => (
          <div key={s.label} className="text-center py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="text-sm font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[7px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* XP BAR */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[var(--gold)] to-amber-600 flex items-center justify-center text-black text-[9px] font-black">{levelInfo.level}</div>
            <span className="text-[10px] font-bold">{levelInfo.title}</span>
          </div>
          <span className="text-[9px] text-[var(--text-muted)]">{levelInfo.current}/{levelInfo.next} XP</span>
        </div>
        <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-amber-500 transition-all duration-500" style={{ width: `${levelInfo.progress}%` }} />
        </div>
      </div>

      {/* TABS */}
      <div className="mx-5 mb-4 flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
        {[
          { key: "jornada", label: "Jornada", icon: "🥋" },
          { key: "atividade", label: "Atividade", icon: "🔥" },
          { key: "social", label: "Social", icon: "👥" },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setSection(tab.key as typeof section)}
            className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
              section === tab.key ? "bg-[rgba(212,168,71,0.12)] text-[var(--gold)] shadow-sm" : "text-[var(--text-muted)]"
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTEUDO */}
      <div className="flex-1 overflow-auto px-5 pb-5 space-y-3">
        {section === "jornada" && (
          <>
            {/* Belt Journey */}
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <span className="text-[11px] font-extrabold block mb-3">Jornada das Faixas</span>
              <div className="flex items-center justify-center gap-1 mb-4">
                {allBelts.map((s, i) => {
                  const isReached = i < currentStep; const isActive = i === currentStep; const isLast = i === allBelts.length - 1
                  return (
                    <div key={s} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                          style={{
                            border: isActive ? "2px solid #d4a84b" : isReached ? `2px solid ${beltColors[i]}66` : "2px solid rgba(255,255,255,0.08)",
                            background: isReached ? `${beltColors[i]}12` : "transparent",
                            color: isReached ? beltColors[i] : "rgba(255,255,255,0.2)",
                            boxShadow: isActive ? "0 0 12px rgba(212,168,75,0.3)" : undefined,
                          }}>
                          {getBeltEmoji(s)}
                        </div>
                        <span className="text-[7px] font-semibold mt-1" style={{ color: isReached ? beltColors[i] : "var(--text-muted)" }}>{s}</span>
                      </div>
                      {!isLast && <div className="h-[2px] flex-1 rounded-full self-start mt-3.5 mx-0.5" style={{ background: i < currentStep ? `${beltColors[i]}66` : "rgba(255,255,255,0.06)" }} />}
                    </div>
                  )
                })}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <svg width="52" height="52" viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                    <circle cx="26" cy="26" r="22" fill="none" stroke="#d4a84b" strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 22}`} strokeDashoffset={`${2 * Math.PI * 22 * (1 - progressoGrau)}`}
                      transform="rotate(-90 26 26)" strokeLinecap="round" />
                    <text x="26" y="29" textAnchor="middle" fontSize="11" fontWeight="900" fill="#d4a84b">{Math.round(progressoGrau * 100)}%</text>
                  </svg>
                  <div className="min-w-0">
                    <div className="text-[8px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Progresso</div>
                    <div className="font-black text-sm mt-0.5">{getBeltEmoji(faixa)} {faixa}</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">{grau + 1}/{maxGraus} graus</div>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="text-[8px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Próxima Faixa</div>
                  <div className="font-black text-sm mt-1">{getBeltEmoji("Roxa")} Roxa</div>
                  <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">200 aulas</div>
                </div>
              </div>
            </div>

            {/* Meta Semanal */}
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-2 mb-2.5">
                <Target className="w-3.5 h-3.5 text-[var(--gold)]" />
                <span className="text-[11px] font-extrabold">Meta Semanal</span>
              </div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold">Aulas essa semana</span>
                <span className="text-[11px] font-bold text-emerald-400">6/8</span>
              </div>
              <div className="h-2 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: "75%" }} />
              </div>
            </div>

            {/* XP Level */}
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--gold)] to-amber-700 flex items-center justify-center text-black font-black text-lg shadow-lg shadow-[var(--gold)]/20">
                  {levelInfo.level}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{levelInfo.title}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Lv.{levelInfo.level}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                    <span className="text-[var(--text-secondary)]">{totalAulas} aulas</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                    <span className="text-[var(--text-secondary)]">{levelInfo.next} XP p/ próximo</span>
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-amber-500" style={{ width: `${levelInfo.progress}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {section === "atividade" && (
          <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span className="text-[11px] font-extrabold">Presenças Recentes</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 28 }).map((_, i) => {
                const hasPresenca = [2, 5, 8, 12, 15, 19, 22, 25, 27].includes(i)
                return (
                  <div key={i} className="aspect-square rounded-sm"
                    style={{ background: hasPresenca ? "rgba(212,168,71,0.3)" : "rgba(255,255,255,0.04)" }}
                  />
                )
              })}
            </div>
            <div className="text-[9px] text-[var(--text-muted)] mt-2">Últimos 28 dias</div>
          </div>
        )}

        {section === "social" && (
          <div className="rounded-xl p-6 text-center" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: "rgba(212,168,71,0.06)", border: "1px solid rgba(212,168,71,0.08)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <span className="font-bold text-sm">Compartilhe sua jornada</span>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">Convide amigos para treinar com você</p>
          </div>
        )}
      </div>
    </div>
  )
}

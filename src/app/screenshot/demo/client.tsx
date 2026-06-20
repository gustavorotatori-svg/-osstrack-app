"use client"

import { getBeltColor, getBeltEmoji } from "@/lib/utils"

const faixa = "Azul"
const grau = 2
const maxGraus = 4
const progressoGrau = (grau + 1) / maxGraus
const totalAulas = 42
const aulasEsteMes = 12
const streak = 12
const pontos = 2840
const nome = "Rafael Oliveira"
const academia = "Academia Modelo"
const nivelDisciplina = "guerreiro"

const steps = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]
const currentStep = 1
const beltColors = ["#e5e5e5", "#2563eb", "#9333ea", "#92400e", "#222"]

function getLevelInfo(total: number) {
  const thresholds = [0, 50, 150, 300, 500, 800, 1200]
  const titles = ["Iniciante", "Regular", "Dedicado", "Experiente", "Avançado", "Elite", "Master"]
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (total >= thresholds[i]) {
      const current = total - thresholds[i]
      const next = thresholds[i + 1] ? thresholds[i + 1] - thresholds[i] : thresholds[i] - thresholds[i - 1]
      return { level: i + 1, current, next, progress: Math.min((current / next) * 100, 100), title: titles[i] }
    }
  }
  return { level: 1, current: 0, next: 50, progress: 0, title: "Iniciante" }
}

const levelInfo = getLevelInfo(totalAulas)

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
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(212,168,71,0.1)", color: "var(--gold)" }}>
      {info.icone} {info.label}
    </span>
  )
}

export function ScreenshotDemo() {
  return (
    <div style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* App bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: "linear-gradient(135deg, #d4a84b, #b8912e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#000" }}>O</div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>OssTrack</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>check-in</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflow: "auto", padding: "12px 16px" }}>
        {/* Hero */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #d4a84b, #b8912e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 900, fontSize: 18, flexShrink: 0 }}>R</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 16, fontWeight: 900 }}>{nome}</span>
                <NivelTag nivel={nivelDisciplina} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span className={`inline-flex items-center gap-1 text-[0.625rem] font-bold px-2.5 py-0.5 rounded-full ${getBeltColor(faixa)}`}>
                  {getBeltEmoji(faixa)} {faixa} ★★★
                </span>
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{academia}</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>· Lv.{levelInfo.level}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#f97316" }}>{streak}</div>
            <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>streak</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
          {[
            { value: aulasEsteMes, label: "Aulas/mês", color: "#60a5fa" },
            { value: totalAulas, label: "Total", color: "#a855f7" },
            { value: streak, label: "Streak", color: "#f97316" },
            { value: `${Math.round((aulasEsteMes / 8) * 100)}%`, label: "Meta", color: "#d4a84b" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center", padding: "10px 4px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* XP bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg, #d4a84b, #b8912e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#000" }}>{levelInfo.level}</div>
              <span style={{ fontSize: 11, fontWeight: 700 }}>{levelInfo.title}</span>
            </div>
            <span style={{ fontSize: 9, color: "var(--text-muted)" }}>{levelInfo.current}/{levelInfo.next} XP</span>
          </div>
          <div style={{ height: 5, borderRadius: 4, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #d4a84b, #f59e0b)", width: `${levelInfo.progress}%` }} />
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, padding: 4, borderRadius: 12, background: "rgba(255,255,255,0.03)" }}>
          {[
            { key: "jornada", label: "Jornada", icon: "🥋" },
            { key: "atividade", label: "Atividade", icon: "🔥" },
            { key: "social", label: "Social", icon: "👥" },
          ].map((tab) => (
            <div key={tab.key} style={{
              flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 11, fontWeight: 700, textAlign: "center",
              background: tab.key === "jornada" ? "rgba(212,168,71,0.12)" : "transparent",
              color: tab.key === "jornada" ? "#d4a84b" : "var(--text-muted)",
            }}>
              {tab.icon} {tab.label}
            </div>
          ))}
        </div>

        {/* Jornada content */}
        <div style={{ borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.01)", marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 800, display: "block", marginBottom: 12 }}>Jornada das Faixas</span>

          {/* Belt bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, marginBottom: 16 }}>
            {steps.map((s, i) => {
              const isReached = i < currentStep
              const isActive = i === currentStep
              const isLast = i === steps.length - 1
              return (
                <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                      border: isActive ? "2px solid #d4a84b" : isReached ? `2px solid ${beltColors[i]}66` : "2px solid rgba(255,255,255,0.08)",
                      background: isReached ? `${beltColors[i]}12` : "transparent",
                      color: isReached ? beltColors[i] : "rgba(255,255,255,0.2)",
                      boxShadow: isActive ? "0 0 12px rgba(212,168,75,0.3)" : undefined,
                    }}>
                      {getBeltEmoji(s)}
                    </div>
                    <span style={{ fontSize: 8, color: isReached ? beltColors[i] : "var(--text-muted)", fontWeight: 600, marginTop: 4 }}>{s}</span>
                  </div>
                  {!isLast && (
                    <div style={{
                      flex: 1, height: 2, borderRadius: 1,
                      background: i < currentStep ? `${beltColors[i]}66` : "rgba(255,255,255,0.06)",
                      marginBottom: 22,
                    }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Progress ring + next belt */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
              {/* Progress ring simplified */}
              <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                <circle cx="28" cy="28" r="24" fill="none" stroke="#d4a84b" strokeWidth="5"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - progressoGrau)}`}
                  transform="rotate(-90 28 28)" strokeLinecap="round" />
                <text x="28" y="30" textAnchor="middle" fontSize="12" fontWeight="900" fill="#d4a84b">{Math.round(progressoGrau * 100)}%</text>
              </svg>
              <div>
                <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>Progresso</div>
                <div style={{ fontSize: 14, fontWeight: 900 }}>{getBeltEmoji(faixa)} {faixa}</div>
                <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>{grau + 1}/{maxGraus} graus</div>
              </div>
            </div>
            <div style={{ padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>Próxima Faixa</div>
              <div style={{ fontSize: 14, fontWeight: 900, marginTop: 2 }}>{getBeltEmoji("Roxa")} Roxa</div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 2 }}>200 aulas</div>
            </div>
          </div>
        </div>

        {/* Mission card */}
        <div style={{ borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.01)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800 }}>Meta Semanal</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#22c55e" }}>6/8 aulas</span>
          </div>
          <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #22c55e, #16a34a)", width: "75%" }} />
          </div>
        </div>

        {/* Nav dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 16 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: i === 0 ? 14 : 4, height: 4, borderRadius: 4, background: i === 0 ? "linear-gradient(90deg, #d4a84b, #f59e0b)" : "rgba(255,255,255,0.1)" }} />
          ))}
        </div>
      </div>
    </div>
  )
}

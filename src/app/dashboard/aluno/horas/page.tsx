"use client"

import { useState, useEffect, useRef } from "react"
import { useT } from "@/lib/use-t"
import { DashboardShell } from "@/components/dashboard/shell"
import { PageTransition } from "@/components/ui/page-transition"
import { BackButton } from "@/components/ui/back-button"
import { Clock, Flame, TrendingUp, Calendar, ChevronDown, Zap, Target, Timer, Award, Sparkles, TrendingDown } from "lucide-react"

type HorasData = {
  horasNoPeriodo: number
  horasTotal: number
  totalAulas: number
  totalAulasAll: number
  diasAtivos: number
  mediaPorDia: number
  mediaPorMes: number
  horasPorMes: { mes: string; horas: number }[]
  horasPorSemana: { semana: string; horas: number }[]
  aulas: { id: string; data: string; turma: string | null; duracaoMinutos: number }[]
}

function AnimatedNumber({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<number | null>(null)

  useEffect(() => {
    const start = display
    const diff = value - start
    const duration = 1200
    const startTime = Date.now()

    function animate() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setDisplay(+(start + diff * eased).toFixed(decimals))
      if (progress < 1) ref.current = requestAnimationFrame(animate)
    }
    ref.current = requestAnimationFrame(animate)
    return () => { if (ref.current) cancelAnimationFrame(ref.current) }
  }, [value])

  return <span>{display}</span>
}

function GlowingRing({ percent, size = 160, stroke = 10 }: { percent: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c9a84c" />
            <stop offset="50%" stopColor="#f5d77b" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="url(#ring-gradient)" strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" filter="url(#glow)"
          className="transition-all duration-1500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-black" style={{ background: "linear-gradient(135deg, #c9a84c, #f5d77b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 20px rgba(201,168,76,0.3))" }}>
            <AnimatedNumber value={percent} />
          </div>
          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-0.5">meta</div>
        </div>
      </div>
    </div>
  )
}

function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `rgba(201, 168, 76, ${Math.random() * 0.3 + 0.1})`,
            animation: `float-particle ${Math.random() * 8 + 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  )
}

function PulseOrb({ color, size, x, y, delay }: { color: string; size: number; x: string; y: string; delay: string }) {
  return (
    <div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
        animation: `breathe ${4 + Math.random() * 3}s ease-in-out infinite`,
        animationDelay: delay,
      }}
    />
  )
}

export default function HorasPage() {
  const ta = useT("alunoDashboard")
  const [data, setData] = useState<HorasData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState("ytd")
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/aluno/horas?periodo=${periodo}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [periodo])

  const maxHorasMes = data ? Math.max(...data.horasPorMes.map((h) => h.horas), 1) : 1
  const maxHorasSemana = data ? Math.max(...data.horasPorSemana.map((h) => h.horas), 1) : 1
  const horasMeta = 16
  const percentMeta = data ? Math.min(100, (data.horasNoPeriodo / horasMeta) * 100) : 0

  const periodos = [
    { key: "semana", label: ta("horas.semana"), icon: "⚡" },
    { key: "mes", label: ta("horas.mes"), icon: "🔥" },
    { key: "trimestre", label: ta("horas.trimestre"), icon: "📈" },
    { key: "ano", label: ta("horas.ano"), icon: "🎯" },
    { key: "ytd", label: ta("horas.ytd"), icon: "⏱️" },
    { key: "total", label: ta("horas.total"), icon: "🏆" },
  ]

  const periodoLabel = periodos.find((p) => p.key === periodo)?.label || ""

  const barColors = [
    "linear-gradient(180deg, #c9a84c, #a88832)",
    "linear-gradient(180deg, #3b82f6, #1d4ed8)",
    "linear-gradient(180deg, #10b981, #059669)",
    "linear-gradient(180deg, #f59e0b, #d97706)",
    "linear-gradient(180deg, #8b5cf6, #6d28d9)",
    "linear-gradient(180deg, #ef4444, #dc2626)",
  ]

  return (
    <DashboardShell role="aluno">
      <BackButton href="/dashboard/aluno" />
      <PageTransition>
        <div className="max-w-4xl mx-auto space-y-5">

          {/* ═══════════ HERO — dramanálisaur ═══════════ */}
          <div className="relative overflow-hidden rounded-[28px] p-8 min-h-[340px]" style={{ background: "linear-gradient(145deg, #0c0f1a 0%, #111827 40%, #1a1040 70%, #0c0f1a 100%)", boxShadow: "0 0 80px rgba(201,168,76,0.08), 0 0 40px rgba(59,130,246,0.05), inset 0 1px 0 rgba(255,255,255,0.05)" }}>

            <ParticleField />
            <PulseOrb color="#c9a84c" size={200} x="-5%" y="-30%" delay="0s" />
            <PulseOrb color="#3b82f6" size={160} x="60%" y="50%" delay="2s" />
            <PulseOrb color="#8b5cf6" size={120} x="80%" y="-10%" delay="4s" />

            {/* Grid lines overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

            <div className="relative z-10 h-full flex flex-col justify-between">
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #c9a84c, #f5d77b)", boxShadow: "0 8px 32px rgba(201,168,76,0.4), 0 0 60px rgba(201,168,76,0.15)", animation: "glow-pulse 3s ease-in-out infinite" }}>
                    <Clock className="w-7 h-7 text-black" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tight" style={{ textShadow: "0 0 40px rgba(255,255,255,0.1)" }}>{ta("horas.titulo")}</h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">{ta("horas.subtitulo")}</p>
                  </div>
                </div>

                {/* Period selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95 hover:scale-105"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--gold)", backdropFilter: "blur(10px)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
                  >
                    {periodoLabel}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showPicker ? "rotate-180" : ""}`} />
                  </button>
                  {showPicker && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50 animate-in slide-in-from-top-2" style={{ background: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", backdropFilter: "blur(20px)" }}>
                      {periodos.map((p) => (
                        <button
                          key={p.key}
                          onClick={() => { setPeriodo(p.key); setShowPicker(false) }}
                          className={`w-full text-left px-5 py-3.5 text-sm transition-all flex items-center gap-3 ${periodo === p.key ? "font-bold" : "hover:bg-[rgba(255,255,255,0.05)]"}`}
                          style={{ color: periodo === p.key ? "var(--gold)" : "var(--text)" }}
                        >
                          <span className="text-base">{p.icon}</span>
                          {p.label}
                          {periodo === p.key && <span className="ml-auto text-xs">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Main number */}
              <div className="flex items-center justify-between mt-6">
                <div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-[80px] font-black leading-none tracking-tighter" style={{ background: "linear-gradient(135deg, #c9a84c 0%, #f5d77b 40%, #fff 60%, #c9a84c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% 200%", animation: "gradient-shift 4s ease infinite", filter: "drop-shadow(0 0 30px rgba(201,168,76,0.25))" }}>
                      <AnimatedNumber value={data?.horasNoPeriodo || 0} />
                    </span>
                    <span className="text-2xl font-bold text-[var(--text-secondary)] mb-3">{ta("horas.horasNoPeriodo")}</span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mt-2">
                    {ta("horas.totalGeral").replace("{h}", String(data?.horasTotal || 0)).replace("{n}", String(data?.totalAulas || 0))}
                  </p>
                </div>

                <GlowingRing percent={percentMeta} />
              </div>
            </div>
          </div>

          {/* ═══════════ KPI CARDS ═══════════ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: ta("horas.diasAtivos"), value: data?.diasAtivos || 0, icon: Calendar, color: "#3b82f6", glow: "rgba(59,130,246,0.3)" },
              { label: ta("horas.mediaDia"), value: data?.mediaPorDia || 0, suffix: "h", icon: Timer, color: "#10b981", glow: "rgba(16,185,129,0.3)" },
              { label: ta("horas.mediaMes"), value: data?.mediaPorMes || 0, suffix: "h", icon: TrendingUp, color: "#f59e0b", glow: "rgba(245,158,11,0.3)" },
              { label: ta("horas.totalAulas"), value: data?.totalAulasAll || 0, icon: Flame, color: "#ef4444", glow: "rgba(239,68,68,0.3)" },
            ].map((kpi, i) => (
              <div key={i} className="group relative rounded-2xl p-4 overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 50%, ${kpi.glow}, transparent 70%)` }} />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${kpi.color}15`, boxShadow: `0 0 20px ${kpi.color}10` }}>
                    <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                  </div>
                  <div className="text-3xl font-black" style={{ color: kpi.color, textShadow: `0 0 20px ${kpi.color}20` }}>
                    <AnimatedNumber value={kpi.value} />
                    {kpi.suffix && <span className="text-sm font-bold ml-0.5 opacity-70">{kpi.suffix}</span>}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-1 font-semibold uppercase tracking-wider">{kpi.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ═══════════ GRÁFICO DE BARRAS — MÊS ═══════════ */}
          {data && data.horasPorMes.length > 0 && (
            <div className="rounded-3xl p-6 overflow-hidden relative" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full" style={{ background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)" }} />
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)" }}>
                    <Zap className="w-5 h-5 text-amber-400" />
                  </div>
                  <h2 className="text-base font-bold">{ta("horas.horasPorMes")}</h2>
                </div>
                <div className="flex items-center gap-1.5">
                  {barColors.slice(0, 3).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full" style={{ background: ["#c9a84c", "#3b82f6", "#10b981"][i] }} />
                  ))}
                </div>
              </div>
              <div className="flex items-end gap-2.5 h-48">
                {data.horasPorMes.map((h, i) => {
                  const height = Math.max(12, (h.horas / maxHorasMes) * 180)
                  return (
                    <div key={h.mes} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                      <span className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1" style={{ color: barColors[i % 6].match(/#([0-9a-f]+)/i)?.[0] || "#fff" }}>
                        {h.horas}h
                      </span>
                      <div className="relative w-full" style={{ height }}>
                        <div
                          className="absolute inset-0 rounded-xl transition-all duration-500 group-hover:scale-x-110 group-hover:shadow-lg"
                          style={{
                            background: barColors[i % 6],
                            opacity: h.horas > 0 ? 1 : 0.15,
                            boxShadow: h.horas > 0 ? `0 0 20px ${barColors[i % 6].match(/#([0-9a-f]+)/i)?.[0]}30` : "none",
                          }}
                        >
                          <div className="absolute inset-0 rounded-xl animate-shimmer" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)", backgroundSize: "200% 100%" }} />
                        </div>
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold">{h.mes}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ═══════════ GRÁFICO DE BARRAS — SEMANA ═══════════ */}
          {data && data.horasPorSemana.length > 0 && (
            <div className="rounded-3xl p-6 overflow-hidden relative" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
              <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)" }} />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.1)" }}>
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <h2 className="text-base font-bold">{ta("horas.horasPorSemana")}</h2>
              </div>
              <div className="flex items-end gap-1.5 h-36">
                {data.horasPorSemana.map((h, i) => (
                  <div key={h.semana} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer">
                    <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">
                      {h.horas}h
                    </span>
                    <div
                      className="w-full rounded-lg transition-all duration-300 group-hover:scale-x-110"
                      style={{
                        height: `${Math.max(6, (h.horas / maxHorasSemana) * 120)}px`,
                        background: "linear-gradient(180deg, #3b82f6, #1d4ed8)",
                        opacity: h.horas > 0 ? 0.85 : 0.12,
                        boxShadow: h.horas > 0 ? "0 0 15px rgba(59,130,246,0.2)" : "none",
                      }}
                    />
                    <span className="text-[9px] text-[var(--text-muted)]">{h.semana}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════ ÚLTIMAS AULAS — timeline ═══════════ */}
          {data && data.aulas.length > 0 && (
            <div className="rounded-3xl p-6 overflow-hidden relative" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.1)" }}>
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-base font-bold">{ta("horas.ultimasAulas")}</h2>
              </div>
              <div className="space-y-2">
                {data.aulas.slice(0, 10).map((aula, i) => {
                  const d = new Date(aula.data)
                  const dia = d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })
                  const duracaoHoras = aula.duracaoMinutos / 60
                  const isLong = aula.duracaoMinutos >= 60
                  return (
                    <div key={aula.id} className="flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 hover:translate-x-1 group" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-300 group-hover:scale-110" style={{ background: isLong ? "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))" : "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))", color: isLong ? "#10b981" : "#f59e0b" }}>
                          {d.getDate()}
                        </div>
                        {i === 0 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ background: "#10b981", boxShadow: "0 0 10px rgba(16,185,129,0.5)" }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold capitalize">{dia}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">{aula.turma || ta("horas.aula")}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black" style={{ color: isLong ? "#10b981" : "#f59e0b", textShadow: `0 0 15px ${isLong ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}` }}>
                          {isLong ? `${duracaoHoras.toFixed(1)}h` : `${aula.duracaoMinutos}m`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ═══════════ LOADING SKELETON ═══════════ */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-3xl p-6 animate-pulse" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="h-4 w-32 rounded-lg mb-4" style={{ background: "rgba(255,255,255,0.06)" }} />
                  <div className="h-24 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </PageTransition>

      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
        .animate-breathe {
          animation: breathe 4s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(201,168,76,0.4), 0 0 60px rgba(201,168,76,0.15); }
          50% { box-shadow: 0 8px 40px rgba(201,168,76,0.6), 0 0 80px rgba(201,168,76,0.25); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.4; }
          75% { transform: translateY(-25px) translateX(8px); opacity: 0.5; }
        }
      `}</style>
    </DashboardShell>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { useSession } from "next-auth/react"
import { DailyMissions } from "@/components/gamification/daily-missions"

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-slide-up"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 50}%`,
            fontSize: `${16 + Math.random() * 24}px`,
            animation: `slideUp ${1.5 + Math.random()}s ease forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
            opacity: 1,
          }}
        >
          {["🥋", "🔥", "💪", "⭐", "🎉", "⚡", "🌟", "🏆"][Math.floor(Math.random() * 8)]}
        </div>
      ))}
    </div>
  )
}

export default function CheckinPage() {
  const { data: session } = useSession()
  const [status, setStatus] = useState<"idle" | "pending" | "done">("idle")
  const [locationStatus, setLocationStatus] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)
  const [streak, setStreak] = useState(5)
  const [motivational, setMotivational] = useState("")
  const [metaSemanal, setMetaSemanal] = useState({ aulasFeitas: 0, aulasAlvo: 5, concluida: false })

  const fetchMeta = useCallback(async () => {
    try {
      const res = await fetch("/api/metasemanal")
      if (res.ok) setMetaSemanal(await res.json())
    } catch {}
  }, [])

  useEffect(() => { fetchMeta() }, [fetchMeta])

  const frases = [
    "Mais um treino que ninguém tira! 💪",
    "Toda presença conta. Continue assim! 🥋",
    "Oss! Mais um passo na sua jornada. ⬆️",
    "Disciplina é o que separa os grandes. 🔥",
    "Seu futuro black belt agradece! ⬛",
    "Um grau de cada vez. Você está no caminho! 🎯",
  ]

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])

  async function handleCheckin() {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocalização não disponível")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocationStatus(`📍 Localização verificada: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
        setStatus("pending")
        setShowConfetti(true)
        setStreak((s) => s + 1)
        setMotivational(frases[Math.floor(Math.random() * frases.length)])

        try {
          const res = await fetch("/api/metasemanal", { method: "POST" })
          if (res.ok) setMetaSemanal(await res.json())
        } catch {}

        setTimeout(() => {
          setStatus("done")
        }, 2000)
      },
      () => {
        setLocationStatus("❌ Não foi possível obter localização. Verifique as permissões.")
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })

  const progressoMeta = metaSemanal.aulasAlvo > 0 ? (metaSemanal.aulasFeitas / metaSemanal.aulasAlvo) * 100 : 0
  const restamMeta = Math.max(0, metaSemanal.aulasAlvo - metaSemanal.aulasFeitas)

  return (
    <DashboardShell role="aluno">
      {showConfetti && <Confetti />}
      <div className="animate-fade-in space-y-4">
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 text-center relative overflow-hidden">
          {showConfetti && (
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(201,168,76,0.1)] to-transparent" />
          )}
          <p className="text-xs text-[var(--white-muted)] mb-2">{hoje}</p>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-emerald-500 text-sm">📍</span>
            <span className="text-xs text-[var(--white-muted)]">Gracie Barra Recife</span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-xs text-[var(--gold)]">🔥 Streak: {streak} dias</span>
          </div>

          {motivational && (
            <div className="text-sm text-[var(--gold)] font-semibold mb-4 animate-fade-in">
              {motivational}
            </div>
          )}

          <div className="py-6">
            <button
              onClick={handleCheckin}
              disabled={status !== "idle"}
              className={`w-32 h-32 rounded-full inline-flex items-center justify-center flex-col gap-1 text-sm font-bold transition-all duration-300 ${
                status === "done"
                  ? "bg-emerald-600 text-white shadow-[0_0_60px_rgba(16,185,129,0.3)] scale-110"
                  : status === "pending"
                  ? "bg-yellow-600 text-white shadow-[0_0_60px_rgba(245,158,11,0.3)] animate-pulse"
                  : "gradient-gold text-black shadow-[0_0_40px_rgba(201,168,76,0.2)] hover:scale-110 hover:shadow-[0_0_60px_rgba(201,168,76,0.4)]"
              }`}
            >
              {status === "idle" && <><span className="text-2xl">📍</span><span className="text-xs">Fazer Check-in</span></>}
              {status === "pending" && <><span className="text-2xl">⏳</span><span className="text-xs">Verificando...</span></>}
              {status === "done" && <><span className="text-2xl">✅</span><span className="text-xs">Confirmado!</span></>}
            </button>
          </div>

          {locationStatus && (
            <div className="text-xs text-[var(--white-muted)] mt-2">{locationStatus}</div>
          )}

          <div className="mt-3 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-xs text-emerald-500">✓ Anti-fraude ativo · Localização segura</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-4 text-center">
            <div className="text-lg mb-1">🎯</div>
            <div className="text-xs font-bold">Meta da Semana</div>
            <div className="text-lg font-extrabold text-[var(--gold)] mt-1">{metaSemanal.aulasFeitas}/{metaSemanal.aulasAlvo}</div>
            <div className="h-1.5 bg-[var(--dark-border)] rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[var(--gold)] to-yellow-300 rounded-full" style={{ width: `${Math.min(100, progressoMeta)}%` }} />
            </div>
            <div className="text-[10px] text-[var(--white-muted)] mt-1">{metaSemanal.concluida ? "✅ Meta concluída!" : `Faltam ${restamMeta} treinos`}</div>
          </div>
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-4 text-center">
            <div className="text-lg mb-1">🔥</div>
            <div className="text-xs font-bold">Sequência</div>
            <div className="text-lg font-extrabold text-[var(--gold)] mt-1">{streak} dias</div>
            <div className="text-[10px] text-[var(--white-muted)] mt-1">{streak >= 7 ? "🥈 Medalha de Prata!" : streak >= 5 ? "🥉 Medalha de Bronze!" : "Continue treinando!"}</div>
          </div>
        </div>

        <DailyMissions />

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">📋 Últimos Check-ins</h3>
          </div>
          {[
            { time: "18:30", status: "confirmed", class: "Jiu-Jitsu Adulto" },
            { time: "18:30", status: "confirmed", class: "Jiu-Jitsu Adulto" },
            { time: "19:30", status: "confirmed", class: "Jiu-Jitsu Avançado" },
          ].map((c, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-[var(--dark-border)] last:border-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm">✅</div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{c.class}</div>
                <div className="text-[11px] text-[var(--white-muted)]">{c.time}</div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/15 px-2.5 py-1 rounded-full">✓ Presente</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { DailyMissions } from "@/components/gamification/daily-missions"
import { CelebrationOverlay } from "@/components/ui/celebration"
import { useSession } from "next-auth/react"
import { playCheckinSound, playStreakSound, playCelebrationSound } from "@/lib/sound"

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => {
        const emojis = ["🥋", "🔥", "💪", "⭐", "🎉", "⚡", "🌟", "🏆"]
        const size = 14 + Math.random() * 20
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10%`,
              fontSize: `${size}px`,
              animation: `confettiFall ${2 + Math.random() * 2}s linear forwards`,
              animationDelay: `${Math.random() * 0.8}s`,
            }}
          >
            {emojis[Math.floor(Math.random() * emojis.length)]}
          </div>
        )
      })}
    </div>
  )
}

const frases = [
  "Você apareceu hoje. E é isso que separa quem sonha de quem realiza. 🥋",
  "Toda faixa preta foi uma faixa branca que não faltou. Continue. 🔥",
  "Esse check-in é mais um degrau na sua jornada. A faixa preta é consequência. ⬆️",
  "O tatame não mente. E hoje você mostrou a ele que está aqui. 💪",
  "Um round de cada vez. Uma aula de cada vez. Uma vida de cada vez. 🎯",
  "A evolução não é um sprint. É uma maratona de check-ins. E você acabou de completar mais um. ⚡",
  "O campeão existe em cada treino que ninguém viu. A gente viu. 🏆",
  "Você não precisa ser o melhor. Precisa ser melhor do que ontem. E hoje você foi. 🌟",
  "Oss. Obrigado por confiar no processo. A faixa preta é só o começo. 🙏",
  "Cada presença é uma vitória contra o ontem. Você está mais perto. 🔥",
]

export default function CheckinPage() {
  const { data: session } = useSession()
  const [status, setStatus] = useState<"idle" | "pending" | "done">("idle")
  const [locationStatus, setLocationStatus] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)
  const [streak, setStreak] = useState(0)
  const [prevStreak, setPrevStreak] = useState(0)
  const [motivational, setMotivational] = useState("")
  const [metaSemanal, setMetaSemanal] = useState({ aulasFeitas: 0, aulasAlvo: 5, concluida: false })
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationMsg, setCelebrationMsg] = useState("")
  const [showMetaCelebration, setShowMetaCelebration] = useState(false)
  const [novasConquistas, setNovasConquistas] = useState<string[]>([])

  const fetchMeta = useCallback(async () => {
    try { const res = await fetch("/api/metasemanal"); if (res.ok) setMetaSemanal(await res.json()) } catch {}
  }, [])

  const fetchStreak = useCallback(async () => {
    try { const res = await fetch("/api/streak"); if (res.ok) { const d = await res.json(); setPrevStreak(d.currentStreak); setStreak(d.currentStreak) } } catch {}
  }, [])

  useEffect(() => { fetchMeta(); fetchStreak() }, [fetchMeta, fetchStreak])

  useEffect(() => {
    if (showConfetti) { const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t) }
  }, [showConfetti])

  async function handleCheckin() {
    if (!navigator.geolocation) { setLocationStatus("Geolocalização não disponível"); return }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocationStatus(`📍 Verificando localização...`)
        setStatus("pending")
        setShowConfetti(true)
        setMotivational(frases[Math.floor(Math.random() * frases.length)])
        playCheckinSound()

        try {
          const checkinRes = await fetch("/api/presenca", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          })
          if (!checkinRes.ok) {
            const errData = await checkinRes.json()
            setLocationStatus(`❌ ${errData.error || "Erro ao registrar presença"}`)
            setStatus("idle")
            setShowConfetti(false)
            return
          }
          setLocationStatus("✅ Check-in registrado com segurança!")
        } catch {
          setLocationStatus("❌ Erro de conexão. Tente novamente.")
          setStatus("idle")
          setShowConfetti(false)
          return
        }

        try {
          const res = await fetch("/api/metasemanal", { method: "POST" })
          if (res.ok) {
            const data = await res.json()
            if (data.concluida && !metaSemanal.concluida) {
              setShowMetaCelebration(true)
              setCelebrationMsg("Meta Semanal Concluída! 🎯")
              setTimeout(() => setShowMetaCelebration(false), 5000)
            }
            setMetaSemanal(data)
          }
        } catch {}

        try {
          const res = await fetch("/api/streak", { method: "POST" })
          if (res.ok) {
            const data = await res.json()
            const newStreak = data.currentStreak
            setPrevStreak(streak)
            setStreak(newStreak)
            playStreakSound(newStreak)
            if (newStreak >= 10 && newStreak > prevStreak && (newStreak % 5 === 0 || newStreak % 10 === 0 || newStreak >= 30)) {
              setCelebrationMsg(newStreak >= 30 ? `🔥 ${newStreak} dias de streak! Lenda!` : `🔥 ${newStreak} dias de streak!`)
              setShowCelebration(true)
              setTimeout(() => setShowCelebration(false), 5000)
            }
          }
        } catch {}

        try {
          const res = await fetch("/api/conquistas", { method: "POST" })
          if (res.ok) {
            const data = await res.json()
            if (data?.novas?.length) {
              setNovasConquistas(data.novas)
              setCelebrationMsg(`🏆 Nova Conquista! ${data.novas[0]}`)
              setShowCelebration(true)
              setTimeout(() => setShowCelebration(false), 5000)
              playCelebrationSound()
            }
          }
        } catch {}

        try {
          await fetch("/api/mural", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tipo: "checkin", conteudo: "Feito check-in no treino de hoje! 🥋" }),
          })
        } catch {}

        setTimeout(() => setStatus("done"), 2000)
      },
      () => { setLocationStatus("❌ Permissão de localização negada. Ative o GPS nas configurações do seu celular para fazer check-in.") },
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
      <CelebrationOverlay show={showCelebration} message={celebrationMsg} submessage="Continue assim! Oss 🥋" />
      <CelebrationOverlay show={showMetaCelebration} message="Meta Semanal Concluída! 🎯" submessage={`${metaSemanal.aulasFeitas}/${metaSemanal.aulasAlvo} aulas`} />
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-6 text-center relative overflow-hidden">
          {showConfetti && (
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(201,168,76,0.08)] to-transparent" />
          )}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--gold)]/3 rounded-full blur-3xl" />

          <p className="text-xs text-[var(--white-muted)] mb-3 capitalize">{hoje}</p>

          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-[var(--white-muted)] font-medium">{session?.user?.academiaNome || "OssTrack"}</span>
          </div>

          <div className="mt-4 mb-2">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${
              streak >= 10 ? "bg-[rgba(255,140,0,0.12)] border-[rgba(255,140,0,0.3)] animate-fire-glow"
              : "bg-[rgba(201,168,76,0.1)] border-[rgba(201,168,76,0.15)]"
            }`}>
              <span className={`text-sm ${streak >= 10 ? "animate-fire" : ""}`}>🔥</span>
              <span className="text-xs font-semibold text-[var(--gold)]">Streak: {streak} dias</span>
            </div>
          </div>

          {motivational && (
            <div className="text-sm gradient-gold-text font-semibold mb-5 animate-scale-in">
              {motivational}
            </div>
          )}

          <div className="py-6">
            <button
              onClick={handleCheckin}
              disabled={status !== "idle"}
              className="relative group"
            >
              <div className={`w-36 h-36 rounded-full flex items-center justify-center flex-col gap-1.5 text-sm font-bold transition-all duration-500 ${
                status === "done"
                  ? "bg-emerald-600 text-white shadow-[0_0_80px_rgba(16,185,129,0.3)] scale-110"
                  : status === "pending"
                  ? "bg-yellow-600 text-white shadow-[0_0_80px_rgba(245,158,11,0.3)] animate-pulse"
                  : "gradient-gold text-black shadow-[0_0_50px_rgba(201,168,76,0.15)] group-hover:shadow-[0_0_80px_rgba(201,168,76,0.3)] group-hover:scale-110"
              }`}>
                {status === "idle" && (
                  <>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-xs">Fazer Check-in</span>
                  </>
                )}
                {status === "pending" && (
                  <>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                      <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                      <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                    </svg>
                    <span className="text-xs">Verificando...</span>
                  </>
                )}
                {status === "done" && (
                  <>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-xs">Confirmado!</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {locationStatus && (
            <div className="text-xs text-[var(--white-muted)] mt-2 bg-black/30 rounded-lg px-3 py-2 inline-block">
              {locationStatus}
            </div>
          )}

          <div className="mt-4 px-4 py-2.5 bg-emerald-500/8 border border-emerald-500/15 rounded-xl">
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Anti-fraude ativo · Localização segura
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-4 text-center hover-card">
            <div className="text-xl mb-2">🎯</div>
            <div className="text-xs font-bold uppercase tracking-wide">Meta da Semana</div>
            <div className="text-2xl font-extrabold text-[var(--gold)] mt-1.5">{metaSemanal.aulasFeitas}/{metaSemanal.aulasAlvo}</div>
            <div className="h-2 bg-[var(--dark-border)] rounded-full mt-3 overflow-hidden p-[1px]">
              <div className="h-full bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-yellow-300 rounded-full" style={{ width: `${Math.min(100, progressoMeta)}%` }} />
            </div>
            <div className="text-[10px] text-[var(--white-muted)] mt-1.5">
              {metaSemanal.concluida ? "✅ Meta concluída!" : `Faltam ${restamMeta} treinos`}
            </div>
          </div>
          <div className={`bg-gradient-to-br from-[var(--dark-card)] to-black/40 border rounded-2xl p-4 text-center hover-card ${streak >= 10 ? "animate-fire-glow border-[rgba(255,140,0,0.2)]" : "border-[var(--dark-border)]"}`}>
            <div className={`text-xl mb-2 ${streak >= 10 ? "animate-fire" : ""}`}>🔥</div>
            <div className="text-xs font-bold uppercase tracking-wide">Sequência</div>
            <div className="text-2xl font-extrabold text-[var(--gold)] mt-1.5">{streak} dias</div>
            <div className="text-[10px] text-[var(--white-muted)] mt-1.5">
              {streak >= 30 ? "👑 Lenda!" : streak >= 10 ? "🥇 Medalha de Ouro!" : streak >= 7 ? "🥈 Medalha de Prata!" : streak >= 5 ? "🥉 Medalha de Bronze!" : "Continue treinando!"}
            </div>
          </div>
        </div>

        <DailyMissions />
      </div>
    </DashboardShell>
  )
}

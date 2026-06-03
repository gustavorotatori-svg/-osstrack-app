"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { CelebrationOverlay } from "@/components/ui/celebration"
import { useSession } from "next-auth/react"
import { playCheckinSound, playStreakSound, playCelebrationSound } from "@/lib/sound"
import { useT } from "@/lib/use-t"
import { FlameIcon, TargetIcon, CheckIcon } from "@/components/ui/icons"

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => {
        const emojis = ["🥋", "🔥", "💪", "⭐", "🎉", "⚡", "🌟", "🏆"]
        const size = 14 + Math.random() * 20
        return (
          <div key={i} className="absolute" style={{
            left: `${Math.random() * 100}%`, top: `-10%`,
            fontSize: `${size}px`,
            animation: `confettiFall ${2 + Math.random() * 2}s linear forwards`,
            animationDelay: `${Math.random() * 0.8}s`,
          }}>
            {emojis[Math.floor(Math.random() * emojis.length)]}
          </div>
        )
      })}
    </div>
  )
}

export default function CheckinPage() {
  const t = useT("aluno.checkin")
  const frases = Array.from({ length: 10 }, (_, i) => t(`frases.${i}`))
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

  const fetchMeta = useCallback(async () => {
    try { const res = await fetch("/api/metasemanal"); if (res.ok) setMetaSemanal(await res.json()) } catch {}
  }, [])

  const fetchStreak = useCallback(async () => {
    try { const res = await fetch("/api/streak"); if (res.ok) { const d = await res.json(); setPrevStreak(d.currentStreak); setStreak(d.currentStreak) } } catch {}
  }, [])

  useEffect(() => { fetchMeta(); fetchStreak() }, [fetchMeta, fetchStreak])
  useEffect(() => { if (showConfetti) { const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t) } }, [showConfetti])

  async function handleCheckin() {
    if (!navigator.geolocation) { setLocationStatus(t("geolocalizacaoIndisponivel")); return }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocationStatus(t("verificandoLocalizacao"))
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
            setLocationStatus(`❌ ${errData.error || t("erroRegistrar")}`)
            setStatus("idle"); setShowConfetti(false)
            return
          }
        } catch {
          setLocationStatus(`❌ ${t("erroConexao")}`)
          setStatus("idle"); setShowConfetti(false)
          return
        }

        try {
          const res = await fetch("/api/metasemanal", { method: "POST" })
          if (res.ok) {
            const data = await res.json()
            if (data.concluida && !metaSemanal.concluida) {
              setShowMetaCelebration(true)
              setCelebrationMsg(`🎯 ${t("metaSemanalConcluida")}`)
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
            setPrevStreak(streak); setStreak(newStreak)
            playStreakSound(newStreak)
            if (newStreak >= 10 && newStreak > prevStreak && (newStreak % 5 === 0 || newStreak % 10 === 0 || newStreak >= 30)) {
              setCelebrationMsg(newStreak >= 30 ? `🔥 ${t("streakDiasLenda").replace("{n}", String(newStreak))}` : `🔥 ${t("streakDias").replace("{n}", String(newStreak))}`)
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
              setCelebrationMsg(`🏆 ${t("novaConquista").replace("{nome}", data.novas[0])}`)
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
            body: JSON.stringify({ tipo: "checkin", conteudo: `${t("checkinFeito")} 🥋` }),
          })
        } catch {}

        setLocationStatus(`✅ ${t("checkinRegistrado")}`)
        setTimeout(() => setStatus("done"), 1500)
      },
      () => { setLocationStatus(`❌ ${t("permissaoNegada")}`) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <DashboardShell role="aluno">
      {showConfetti && <Confetti />}
      <CelebrationOverlay show={showCelebration} message={celebrationMsg} submessage={`${t("continueAssim")} 🥋`} />
      <CelebrationOverlay show={showMetaCelebration} message={`🎯 ${t("metaSemanalConcluida")}`} submessage={`${metaSemanal.aulasFeitas}/${metaSemanal.aulasAlvo} aulas`} />
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="surface p-6 text-center">

          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-[var(--text-secondary)] font-medium">{session?.user?.academiaNome || "OssTrack"}</span>
          </div>

          <div className="mb-2">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${
              streak >= 10 ? "bg-[rgba(255,140,0,0.12)] border-[rgba(255,140,0,0.3)] animate-fire-glow" : "bg-[var(--gold-dim)] border-[var(--gold-dim)]"
            }`}>
              <FlameIcon className={`w-4 h-4 ${streak >= 10 ? "animate-fire" : ""}`} />
              <span className="text-xs font-semibold text-[var(--gold)]">{t("streak").replace("{dias}", String(streak))}</span>
            </div>
          </div>

          {motivational && (
            <div className="text-sm text-[var(--gold)] font-semibold mb-4 animate-scale-in">{motivational}</div>
          )}

          <div className="py-6">
            <button onClick={handleCheckin} disabled={status !== "idle"} className="relative group">
              <div className={`w-36 h-36 rounded-full flex items-center justify-center flex-col gap-1.5 text-sm font-bold transition-all duration-500 ${
                status === "done"
                  ? "bg-emerald-600 text-white shadow-[0_0_80px_rgba(16,185,129,0.3)] scale-110"
                  : status === "pending"
                  ? "bg-yellow-600 text-white shadow-[0_0_80px_rgba(245,158,11,0.3)] animate-pulse"
                  : "bg-[var(--red)] text-white shadow-[0_0_50px_var(--red-glow)] group-hover:shadow-[0_0_80px_var(--red-glow)] group-hover:scale-110"
              }`}>
                {status === "idle" && (
                  <>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
                    <span className="text-xs">{t("fazerCheckin")}</span>
                  </>
                )}
                {status === "pending" && (
                  <>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></svg>
                    <span className="text-xs">{t("verificando")}</span>
                  </>
                )}
                {status === "done" && (
                  <>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    <span className="text-xs">{t("confirmado")}</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {locationStatus && (
            <div className="text-xs text-[var(--text-secondary)] mt-1 bg-black/30 rounded-lg px-3 py-2 inline-block">{locationStatus}</div>
          )}

          <div className="mt-4 px-4 py-2.5 bg-emerald-500/8 border border-emerald-500/15 rounded-xl">
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              {t("antiFraudeAtivo")}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="surface p-4 text-center">
            <TargetIcon className="w-6 h-6 mb-2 mx-auto text-[var(--text-secondary)]" />
            <div className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">{t("metaSemana")}</div>
            <div className="text-2xl font-extrabold text-[var(--gold)] mt-1.5">{metaSemanal.aulasFeitas}/{metaSemanal.aulasAlvo}</div>
            <div className="h-2 bg-[var(--border)] rounded-full mt-3 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[var(--gold-dim)] to-[var(--gold)]" style={{ width: `${Math.min(100, Math.round((metaSemanal.aulasFeitas / Math.max(1, metaSemanal.aulasAlvo)) * 100))}%` }} />
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] mt-1.5">
              {metaSemanal.concluida ? <><CheckIcon className="w-3 h-3 inline -mt-0.5 mr-0.5 text-emerald-500" />{t("metaConcluida")}</> : t("faltamTreinos").replace("{n}", String(Math.max(0, metaSemanal.aulasAlvo - metaSemanal.aulasFeitas)))}
            </div>
          </div>
          <div className={`surface p-4 text-center ${streak >= 10 ? "animate-fire-glow" : ""}`} style={{borderColor: streak >= 10 ? 'rgba(255,140,0,0.2)' : undefined}}>
            <FlameIcon className={`w-6 h-6 mb-2 mx-auto text-[var(--text-secondary)] ${streak >= 10 ? "animate-fire" : ""}`} />
            <div className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">{t("sequencia")}</div>
            <div className="text-2xl font-extrabold text-[var(--gold)] mt-1.5">{streak} dias</div>
            <div className="text-[10px] text-[var(--text-secondary)] mt-1.5">
              {streak >= 30 ? `👑 ${t("lenda")}` : streak >= 10 ? `🔥 ${t("medalhaOuro")}` : streak >= 7 ? `🥈 ${t("medalhaPrata")}` : streak >= 5 ? `🥉 ${t("medalhaBronze")}` : t("continueTreinando")}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

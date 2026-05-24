"use client"

import { useRef, useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { playBeep } from "@/lib/sound"

export default function CompartilharPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalAulas: 0, presencasMes: 0, streak: 0, bestStreak: 0 })
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/premium").then((r) => r.json()),
      fetch("/api/perfil").then((r) => r.json()),
    ]).then(([premium, perfil]) => {
      setIsPremium(premium.isPremium)
      setStats({
        totalAulas: perfil.stats?.totalAulas || 0,
        presencasMes: perfil.stats?.thisMonth || 0,
        streak: perfil.stats?.currentStreak || 0,
        bestStreak: perfil.stats?.bestStreak || 0,
      })
      setLoading(false)
    })
  }, [])

  function drawCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    // Background
    const grad = ctx.createLinearGradient(0, 0, 600, 600)
    grad.addColorStop(0, "#0a0a0a"); grad.addColorStop(0.4, "#1a0a0a"); grad.addColorStop(1, "#0a0a0a")
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 600, 600)

    // Glow orbs
    const g1 = ctx.createRadialGradient(500, 100, 50, 500, 100, 300)
    g1.addColorStop(0, "rgba(201,168,76,0.08)"); g1.addColorStop(1, "transparent")
    ctx.fillStyle = g1; ctx.beginPath(); ctx.arc(500, 100, 300, 0, Math.PI * 2); ctx.fill()

    const g2 = ctx.createRadialGradient(100, 500, 50, 100, 500, 250)
    g2.addColorStop(0, "rgba(139,26,26,0.1)"); g2.addColorStop(1, "transparent")
    ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(100, 500, 250, 0, Math.PI * 2); ctx.fill()

    // Logo
    ctx.fillStyle = "#c9a84c"
    ctx.font = "bold 16px Inter, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("OSSTRACK", 300, 50)

    // Avatar circle
    ctx.beginPath(); ctx.arc(300, 160, 55, 0, Math.PI * 2)
    ctx.strokeStyle = "#c9a84c"; ctx.lineWidth = 3; ctx.stroke()
    ctx.fillStyle = "#1e1e1e"; ctx.fill()
    ctx.fillStyle = "#c9a84c"
    ctx.font = "44px Inter, sans-serif"
    ctx.fillText((session?.user?.name || "?").charAt(0).toUpperCase(), 300, 178)

    // Name
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 28px Inter, sans-serif"
    ctx.fillText(session?.user?.name || "", 300, 250)

    // Belt
    ctx.fillStyle = "#c9a84c"
    ctx.font = "16px Inter, sans-serif"
    ctx.fillText(`${session?.user?.faixa || ""} ${"★".repeat((session?.user?.grau || 0) + 1)}`, 300, 278)

    // Stats grid
    const statItems = [
      { label: "Total de Aulas", value: stats.totalAulas, icon: "🥋" },
      { label: "Este Mês", value: stats.presencasMes, icon: "📅" },
      { label: "Streak Atual", value: `${stats.streak}🔥`, icon: "🔥" },
      { label: "Melhor Streak", value: `${stats.bestStreak}🔥`, icon: "🏆" },
    ]

    const startY = 320
    const cols = 2; const cellW = 280; const cellH = 70

    statItems.forEach((item, i) => {
      const col = i % cols; const row = Math.floor(i / cols)
      const x = 20 + col * (cellW + 10); const y = startY + row * (cellH + 8)

      ctx.fillStyle = "rgba(30,30,30,0.6)"
      ctx.beginPath(); ctx.roundRect(x, y, cellW, cellH, 12); ctx.fill()
      ctx.strokeStyle = "rgba(201,168,76,0.15)"; ctx.lineWidth = 1
      ctx.beginPath(); ctx.roundRect(x, y, cellW, cellH, 12); ctx.stroke()

      ctx.textAlign = "left"
      ctx.fillStyle = "#a0a0a0"
      ctx.font = "11px Inter, sans-serif"
      ctx.fillText(item.label, x + 12, y + 22)

      ctx.fillStyle = "#c9a84c"
      ctx.font = "bold 18px Inter, sans-serif"
      ctx.fillText(`${item.icon} ${item.value}`, x + 12, y + 52)
    })

    // Bottom text
    ctx.textAlign = "center"
    ctx.fillStyle = "rgba(255,255,255,0.3)"
    ctx.font = "12px Inter, sans-serif"
    ctx.fillText("ossTrack.app", 300, 570)
  }

  function generateImage() {
    if (!isPremium) { router.push("/dashboard/aluno/premium"); return }

    const canvas = canvasRef.current
    if (!canvas || !session?.user) return
    setGenerating(true)
    playBeep(880, 0.15, 0.3)

    canvas.width = 600; canvas.height = 600
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    drawCanvas(ctx, canvas)

    const link = document.createElement("a")
    link.download = `osstrack-evolucao-${Date.now()}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
    setTimeout(() => setGenerating(false), 500)
    playBeep(1100, 0.2, 0.4)
  }

  function shareWhatsApp() {
    if (!isPremium) { router.push("/dashboard/aluno/premium"); return }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = 600; canvas.height = 600
    drawCanvas(ctx, canvas)
    const url = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = `osstrack-evolucao-${Date.now()}.png`
    link.href = url
    link.click()
  }

  if (loading) return null

  return (
    <DashboardShell role="aluno">
      <div className="animate-fade-in space-y-4">
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 text-center">
          <div className="text-3xl mb-2">{isPremium ? "📱" : "🔒"}</div>
          <h3 className="font-bold">Compartilhar Evolução</h3>
          <p className="text-xs text-[var(--white-muted)]">
            {isPremium ? "Arte automática com suas estatísticas reais — pronta pro Instagram" : "Disponível apenas para assinantes Premium"}
          </p>
        </div>

        {/* Preview card */}
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
          <div className="bg-gradient-to-br from-black via-[#1a0a0a] to-black p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(201,168,76,0.15),transparent_60%)]" />
            <div className="relative">
              <div className="text-[10px] font-bold text-[var(--gold)] tracking-widest uppercase mb-3">OSSTRACK</div>
              <div className="w-16 h-16 rounded-full border-2 border-[var(--gold)] flex items-center justify-center text-2xl font-bold text-[var(--gold)] mx-auto mb-3 bg-[var(--dark-card)]">
                {(session?.user?.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="text-lg font-extrabold">{session?.user?.name || ""}</div>
              <div className="text-xs text-[var(--gold)] font-semibold mt-1">
                {session?.user?.faixa || ""} {"★".repeat((session?.user?.grau || 0) + 1)}
              </div>

              {/* Stats preview */}
              <div className="grid grid-cols-2 gap-2 mt-5 max-w-xs mx-auto">
                {[
                  { label: "Total de Aulas", value: stats.totalAulas, icon: "🥋" },
                  { label: "Este Mês", value: stats.presencasMes, icon: "📅" },
                  { label: "Streak Atual", value: `🔥 ${stats.streak}`, icon: "🔥" },
                  { label: "Melhor Streak", value: `🏆 ${stats.bestStreak}`, icon: "🏆" },
                ].map((s) => (
                  <div key={s.label} className="bg-black/40 border border-[rgba(201,168,76,0.1)] rounded-xl p-3 text-center">
                    <div className="text-[9px] text-[var(--white-muted)] uppercase tracking-wide">{s.label}</div>
                    <div className="text-base font-extrabold text-[var(--gold)] mt-1">{s.icon} {s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="px-6 py-3 border-t border-[var(--dark-border)] flex justify-between items-center text-[11px]">
            <span className="font-extrabold">🥋 OssTrack</span>
            <span className="text-[var(--white-muted)]">ossTrack.app</span>
          </div>
        </div>

        <button
          onClick={generateImage}
          disabled={generating}
          className="w-full py-3.5 rounded-lg font-bold gradient-gold text-black transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
        >
          {generating ? "⚡ Gerando..." : isPremium ? "📸 Baixar Arte" : "🔓 Desbloquear com Premium"}
        </button>

        {isPremium && (
          <div className="flex gap-3">
            <button onClick={shareWhatsApp} className="flex-1 py-3 rounded-lg font-semibold text-sm border border-[var(--dark-border)] text-white hover:border-emerald-500 hover:text-emerald-500 transition-all active:scale-95">
              💬 WhatsApp
            </button>
            <button onClick={generateImage} className="flex-1 py-3 rounded-lg font-semibold text-sm border border-[var(--dark-border)] text-white hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all active:scale-95">
              📸 Instagram
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </DashboardShell>
  )
}

"use client"

import { useT } from "@/lib/use-t"
import { useRef, useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { useSession } from "next-auth/react"
import { playBeep } from "@/lib/sound"

export default function CompartilharPage() {
  const t = useT("aluno.compartilhar")
  const { data: session } = useSession()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalAulas: 0, presencasMes: 0, streak: 0, bestStreak: 0 })
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch("/api/perfil")
      .then((r) => r.json())
      .then((perfil) => {
        setStats({
          totalAulas: perfil.stats?.totalAulas || 0,
          presencasMes: perfil.stats?.thisMonth || 0,
          streak: perfil.stats?.currentStreak || 0,
          bestStreak: perfil.stats?.bestStreak || 0,
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function drawCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    const grad = ctx.createLinearGradient(0, 0, 600, 600)
    grad.addColorStop(0, "#0a0a0a"); grad.addColorStop(0.4, "#1a0a0a"); grad.addColorStop(1, "#0a0a0a")
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 600, 600)

    const g1 = ctx.createRadialGradient(500, 100, 50, 500, 100, 300)
    g1.addColorStop(0, "rgba(201,168,76,0.08)"); g1.addColorStop(1, "transparent")
    ctx.fillStyle = g1; ctx.beginPath(); ctx.arc(500, 100, 300, 0, Math.PI * 2); ctx.fill()

    const g2 = ctx.createRadialGradient(100, 500, 50, 100, 500, 250)
    g2.addColorStop(0, "rgba(139,26,26,0.1)"); g2.addColorStop(1, "transparent")
    ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(100, 500, 250, 0, Math.PI * 2); ctx.fill()

    ctx.fillStyle = "#c9a84c"
    ctx.font = "bold 16px Inter, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("OSSTRACK", 300, 50)

    ctx.beginPath(); ctx.arc(300, 160, 55, 0, Math.PI * 2)
    ctx.strokeStyle = "#c9a84c"; ctx.lineWidth = 3; ctx.stroke()
    ctx.fillStyle = "#1e1e1e"; ctx.fill()
    ctx.fillStyle = "#c9a84c"
    ctx.font = "44px Inter, sans-serif"
    ctx.fillText((session?.user?.name || "?").charAt(0).toUpperCase(), 300, 178)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 28px Inter, sans-serif"
    ctx.fillText(session?.user?.name || "", 300, 250)

    ctx.fillStyle = "#c9a84c"
    ctx.font = "16px Inter, sans-serif"
    ctx.fillText(`${session?.user?.faixa || ""} ${"★".repeat((session?.user?.grau || 0) + 1)}`, 300, 278)

    const statItems = [
      { label: t("totalAulas"), value: stats.totalAulas, icon: "🥋" },
      { label: t("esteMes"), value: stats.presencasMes, icon: "📅" },
      { label: t("streakAtual"), value: `${stats.streak}🔥`, icon: "🔥" },
      { label: t("melhorStreak"), value: `${stats.bestStreak}🔥`, icon: "🏆" },
    ]

    const startY = 320; const cols = 2; const cellW = 280; const cellH = 70

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

    ctx.textAlign = "center"
    ctx.fillStyle = "rgba(255,255,255,0.3)"
    ctx.font = "12px Inter, sans-serif"
    ctx.fillText("ossTrack.app", 300, 570)
  }

  function generateImage() {
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

  async function shareWhatsApp() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = 600; canvas.height = 600
    drawCanvas(ctx, canvas)
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"))
    if (!blob) return
    if (navigator.share && navigator.canShare({ files: [new File([blob], "osstrack.png", { type: "image/png" })] })) {
      await navigator.share({ files: [new File([blob], "osstrack.png", { type: "image/png" })], title: "OssTrack" })
    }
  }

  async function copyToClipboard() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = 600; canvas.height = 600
    drawCanvas(ctx, canvas)
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"))
    if (!blob) return
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      playBeep(1100, 0.2, 0.4)
    } catch {
      const link = document.createElement("a")
      link.download = `osstrack-evolucao-${Date.now()}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    }
  }

  if (loading) return null

  return (
    <DashboardShell role="aluno">
      <div className="animate-fade-in max-w-5xl mx-auto space-y-4">
        <div className="surface p-5 text-center">
          <div className="text-3xl mb-2">📱</div>
          <h3 className="font-bold">{t("title")}</h3>
          <p className="text-xs text-[var(--text-secondary)]">Arte automática com suas estatísticas — pronta pro Instagram</p>
        </div>

        <div className="surface overflow-hidden">
          <div className="bg-gradient-to-br from-black via-[#1a0a0a] to-black p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(201,168,76,0.15),transparent_60%)]" />
            <div className="relative">
              <div className="text-[10px] font-bold text-[var(--gold)] tracking-widest uppercase mb-3">OSSTRACK</div>
              <div className="w-16 h-16 rounded-full border-2 border-[var(--gold)] flex items-center justify-center text-2xl font-bold text-[var(--gold)] mx-auto mb-3 bg-[var(--surface)]">
                {(session?.user?.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="text-lg font-extrabold">{session?.user?.name || ""}</div>
              <div className="text-xs text-[var(--gold)] font-semibold mt-1">
                {session?.user?.faixa || ""} {"★".repeat((session?.user?.grau || 0) + 1)}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-5 max-w-xs mx-auto">
                {[
                  { label: t("totalAulas"), value: stats.totalAulas, icon: "🥋" },
                  { label: t("esteMes"), value: stats.presencasMes, icon: "📅" },
                  { label: t("streakAtual"), value: `🔥 ${stats.streak}`, icon: "🔥" },
                  { label: t("melhorStreak"), value: `🏆 ${stats.bestStreak}`, icon: "🏆" },
                ].map((s) => (
                  <div key={s.label} className="bg-black/40 border border-[var(--gold-dim)] rounded-xl p-3 text-center">
                    <div className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wide">{s.label}</div>
                    <div className="text-base font-extrabold text-[var(--gold)] mt-1">{s.icon} {s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="px-6 py-3 border-t border-[var(--border)] flex justify-between items-center text-[11px]">
            <span className="font-extrabold">🥋 OssTrack</span>
            <span className="text-[var(--text-secondary)]">ossTrack.app</span>
          </div>
        </div>

        <button
          onClick={generateImage}
          disabled={generating}
          className="btn-primary w-full rounded p-4 font-bold text-lg"
        >
          {generating ? `⚡ ${t("gerando")}` : `📸 ${t("baixarArte")}`}
        </button>

        <div className="flex gap-3">
          <button onClick={shareWhatsApp} className="btn-ghost flex-1 rounded p-3">
            💬 Compartilhar
          </button>
          <button onClick={copyToClipboard} className="btn-ghost flex-1 rounded p-3">
            {copied ? "✅ Copiado!" : `📋 ${t("copiar")}`}
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </DashboardShell>
  )
}

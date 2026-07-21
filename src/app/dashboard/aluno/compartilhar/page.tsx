"use client"

import { useT } from "@/lib/use-t"
import { useRef, useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { useSession } from "next-auth/react"
import { playBeep } from "@/lib/sound"
import { getBeltEmoji } from "@/lib/utils"
import { Share2, Copy, Download, Image } from "lucide-react"
import { toast } from "sonner"
import { PageTransition } from "@/components/ui/page-transition"
import { BackButton } from "@/components/ui/back-button"

export default function CompartilharPage() {
  const t = useT("aluno.compartilhar")
  const tc = useT("compartilharPage")
  const { data: session } = useSession()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalAulas: 0, presencasMes: 0, streak: 0, bestStreak: 0 })
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [storyMode, setStoryMode] = useState(false)

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
      .catch(() => { toast.error("Erro ao carregar perfil"); setLoading(false) })
  }, [])

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  function drawCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, isStory: boolean) {
    const w = canvas.width
    const h = canvas.height

    // Background
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, "#0a0a0a")
    grad.addColorStop(0.3, "#1a0a0a")
    grad.addColorStop(0.7, "#0a0a0a")
    grad.addColorStop(1, "#050505")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)

    // Gold glow top-right
    const g1 = ctx.createRadialGradient(w * 0.8, h * 0.1, 50, w * 0.8, h * 0.1, w * 0.5)
    g1.addColorStop(0, "rgba(201,168,76,0.12)")
    g1.addColorStop(1, "transparent")
    ctx.fillStyle = g1
    ctx.fillRect(0, 0, w, h)

    // Red glow bottom-left
    const g2 = ctx.createRadialGradient(w * 0.15, h * 0.85, 50, w * 0.15, h * 0.85, w * 0.4)
    g2.addColorStop(0, "rgba(139,26,26,0.1)")
    g2.addColorStop(1, "transparent")
    ctx.fillStyle = g2
    ctx.fillRect(0, 0, w, h)

    // Header bar
    ctx.fillStyle = "rgba(201,168,76,0.06)"
    roundRect(ctx, 0, 0, w, isStory ? 100 : 60, 0)
    ctx.fill()

    ctx.fillStyle = "#c9a84c"
    ctx.font = `bold ${isStory ? 24 : 16}px Inter, system-ui, sans-serif`
    ctx.textAlign = "center"
    ctx.fillText("OSSTRACK", w / 2, isStory ? 50 : 30)

    // Avatar circle
    const avatarY = isStory ? 190 : 100
    const avatarR = isStory ? 65 : 50
    const nameY = isStory ? 290 : 170
    const beltY = isStory ? 325 : 200
    const statsStartY = isStory ? 390 : 240

    ctx.beginPath()
    ctx.arc(w / 2, avatarY, avatarR + 3, 0, Math.PI * 2)
    ctx.strokeStyle = "#c9a84c"
    ctx.lineWidth = 2.5
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(w / 2, avatarY, avatarR, 0, Math.PI * 2)
    ctx.fillStyle = "#1a1a1a"
    ctx.fill()

    ctx.fillStyle = "#c9a84c"
    ctx.font = `bold ${isStory ? 52 : 40}px Inter, system-ui, sans-serif`
    ctx.textAlign = "center"
    ctx.fillText((session?.user?.name || "?").charAt(0).toUpperCase(), w / 2, avatarY + (isStory ? 18 : 14))

    // Name
    ctx.fillStyle = "#ffffff"
    ctx.font = `bold ${isStory ? 32 : 22}px Inter, system-ui, sans-serif`
    ctx.textAlign = "center"
    ctx.fillText(session?.user?.name || "", w / 2, nameY)

    // Belt with emoji
    const beltText = `${getBeltEmoji(session?.user?.faixa || "")} ${session?.user?.faixa || ""} ${"★".repeat((session?.user?.grau || 0) + 1)}`
    ctx.fillStyle = "#c9a84c"
    ctx.font = `${isStory ? 20 : 14}px Inter, system-ui, sans-serif`
    ctx.fillText(beltText, w / 2, beltY)

    // Stats grid
    const statItems = [
      { label: "Total Aulas", value: String(stats.totalAulas), icon: "🥋" },
      { label: "Este Mês", value: String(stats.presencasMes), icon: "📅" },
      { label: "Streak", value: `${stats.streak}🔥`, icon: "🔥" },
      { label: "Best Streak", value: `${stats.bestStreak}🔥`, icon: "🏆" },
    ]

    const cols = isStory ? 1 : 2
    const gap = isStory ? 10 : 8
    const cardW = isStory ? w * 0.75 : (w - (cols + 1) * gap) / cols
    const cardH = isStory ? 60 : 55

    statItems.forEach((item, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = gap + col * (cardW + gap)
      const y = statsStartY + row * (cardH + gap)

      ctx.fillStyle = "rgba(30,30,30,0.6)"
      roundRect(ctx, x, y, cardW, cardH, 10)
      ctx.fill()
      ctx.strokeStyle = "rgba(201,168,76,0.12)"
      ctx.lineWidth = 1
      roundRect(ctx, x, y, cardW, cardH, 10)
      ctx.stroke()

      ctx.textAlign = "left"
      ctx.fillStyle = "#a0a0a0"
      ctx.font = `${isStory ? 13 : 11}px Inter, system-ui, sans-serif`
      ctx.fillText(item.label, x + 12, y + 20)

      ctx.fillStyle = "#c9a84c"
      ctx.font = `bold ${isStory ? 20 : 16}px Inter, system-ui, sans-serif`
      ctx.fillText(`${item.icon} ${item.value}`, x + 12, y + cardH - 12)
    })

    // Footer
    ctx.textAlign = "center"
    ctx.fillStyle = "rgba(255,255,255,0.25)"
    ctx.font = `${isStory ? 14 : 11}px Inter, system-ui, sans-serif`
    ctx.fillText("ossTrack.app", w / 2, h - 15)
  }

  function generateImage(story = false) {
    const canvas = canvasRef.current
    if (!canvas || !session?.user) return
    setGenerating(true)
    setStoryMode(story)
    playBeep(880, 0.15, 0.3)

    canvas.width = story ? 1080 : 600
    canvas.height = story ? 1920 : 600
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    drawCanvas(ctx, canvas, story)

    const link = document.createElement("a")
    link.download = `osstrack-${story ? "story" : "card"}-${Date.now()}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
    setTimeout(() => setGenerating(false), 500)
    playBeep(1100, 0.2, 0.4)
  }

  async function shareWhatsApp() {
    const canvas = canvasRef.current
    if (!canvas || !session?.user) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = 600
    canvas.height = 600
    drawCanvas(ctx, canvas, false)
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"))
    if (!blob) return

    const shareText = `🥋 *Meu progresso no Jiu-Jitsu*\n\n` +
      `👤 ${session.user.name}\n` +
      `🥋 ${getBeltEmoji(session.user.faixa || "")} ${session.user.faixa} ${"★".repeat((session.user.grau || 0) + 1)}\n` +
      `📊 ${stats.totalAulas} aulas totais\n` +
      `🔥 Streak: ${stats.streak} dias\n\n` +
      `Via ossTrack.app`

    if (navigator.share && navigator.canShare({ files: [new File([blob], "osstrack.png", { type: "image/png" })] })) {
      await navigator.share({
        files: [new File([blob], "osstrack.png", { type: "image/png" })],
        title: "OssTrack - Meu Progresso",
        text: shareText,
      })
    } else {
      // Fallback: copy text and download
      await navigator.clipboard.writeText(shareText)
      const link = document.createElement("a")
      link.download = `osstrack-card-${Date.now()}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    }
  }

  async function copyToClipboard() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = 600
    canvas.height = 600
    drawCanvas(ctx, canvas, false)
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"))
    if (!blob) return
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      playBeep(1100, 0.2, 0.4)
    } catch {
      const link = document.createElement("a")
      link.download = `osstrack-card-${Date.now()}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    }
  }

  const faixa = session?.user?.faixa || ""

  if (loading) {
    return (
      <DashboardShell role="aluno">
        <BackButton href="/dashboard/aluno" />
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="glass-card p-6 text-center space-y-4">
            <div className="h-4 w-32 glass-card rounded-lg mx-auto" />
            <div className="h-8 w-48 glass-card rounded-lg mx-auto" />
            <div className="w-20 h-20 rounded-full glass-card mx-auto" />
            <div className="h-4 w-56 glass-card rounded-lg mx-auto" />
            <div className="h-4 w-64 glass-card rounded-lg mx-auto" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-4 text-center space-y-3">
              <div className="h-6 w-6 glass-card rounded mx-auto" />
              <div className="h-3 w-20 glass-card rounded mx-auto" />
              <div className="h-8 w-12 glass-card rounded mx-auto" />
            </div>
            <div className="glass-card p-4 text-center space-y-3">
              <div className="h-6 w-6 glass-card rounded mx-auto" />
              <div className="h-3 w-20 glass-card rounded mx-auto" />
              <div className="h-8 w-12 glass-card rounded mx-auto" />
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="aluno">
      <BackButton href="/dashboard/aluno" />
      <PageTransition>
        <div className="animate-fade-in max-w-5xl mx-auto space-y-4">

          {/* Tech Hero */}
          <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-[rgba(201,168,76,0.08)] via-[rgba(10,10,10,0.8)] to-[rgba(10,10,10,0.9)] p-6">
            <div className="absolute top-[-60px] right-[-60px] w-40 h-40 bg-[var(--gold)]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-[-40px] left-[-40px] w-32 h-32 bg-[var(--gold)]/3 rounded-full blur-3xl" />
            <div className="relative z-10">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--gold)]">{tc("badge")}</span>
              <h1 className="text-2xl font-black tracking-tight">{t("title")}</h1>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{tc("descricao")}</p>
            </div>
          </div>

          {/* Preview */}
          <div className="card overflow-hidden">
            {/* Card preview */}
            <div className="bg-gradient-to-br from-black via-[#1a0a0a] to-black p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(201,168,76,0.15),transparent_60%)]" />
              <div className="relative">
                <div className="text-[10px] font-bold text-[var(--gold)] tracking-widest uppercase mb-3">OSSTRACK</div>
                <div className={`w-20 h-20 rounded-full border-2 mx-auto mb-3 flex items-center justify-center text-3xl font-bold bg-black/20`} style={{ borderColor: "var(--gold)" }}>
                  <span className="text-[var(--gold)]">{(session?.user?.name || "?").charAt(0).toUpperCase()}</span>
                </div>
                <div className="text-xl font-extrabold">{session?.user?.name || ""}</div>
                <div className="text-sm text-[var(--gold)] font-semibold mt-1">
                  {getBeltEmoji(faixa)} {faixa} {"★".repeat((session?.user?.grau || 0) + 1)}
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

          {/* Download buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => generateImage(false)} disabled={generating}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[var(--gold)] to-[#e8c84a] text-black hover:shadow-lg hover:shadow-[var(--gold)]/20 transition-all active:scale-[0.97]">
<Download className="w-4 h-4" /> {tc("card600")}
            </button>
            <button onClick={() => generateImage(true)} disabled={generating}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm border border-[var(--gold)]/30 text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-all active:scale-[0.97]">
<Image className="w-4 h-4" /> {tc("stories")}
            </button>
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={shareWhatsApp}
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-all">
              <Share2 className="w-4 h-4" /> {tc("compartilhar")}
            </button>
            <button onClick={copyToClipboard}
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-all">
              {copied ? <span>{tc("copiado")}</span> : <><Copy className="w-4 h-4" /> {tc("copiar")}</>}
            </button>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

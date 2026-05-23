"use client"

import { useRef, useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function CompartilharPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/premium").then((r) => r.json()).then((d) => {
      setIsPremium(d.isPremium)
      setLoading(false)
    })
  }, [])

  function generateImage() {
    if (!isPremium) {
      router.push("/dashboard/aluno/premium")
      return
    }

    const canvas = canvasRef.current
    if (!canvas || !session?.user) return

    canvas.width = 600
    canvas.height = 600
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const grad = ctx.createLinearGradient(0, 0, 600, 600)
    grad.addColorStop(0, "#0a0a0a")
    grad.addColorStop(0.5, "#1a0a0a")
    grad.addColorStop(1, "#0a0a0a")
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 600, 600)

    ctx.fillStyle = "rgba(201,168,76,0.05)"
    ctx.beginPath()
    ctx.arc(500, 100, 300, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "rgba(139,26,26,0.08)"
    ctx.beginPath()
    ctx.arc(100, 500, 250, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#c9a84c"
    ctx.font = "bold 14px Inter, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("OSSTRACK", 300, 60)

    ctx.beginPath()
    ctx.arc(300, 180, 60, 0, Math.PI * 2)
    ctx.strokeStyle = "#c9a84c"
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.fillStyle = "#1e1e1e"
    ctx.fill()

    ctx.fillStyle = "#c9a84c"
    ctx.font = "40px Inter, sans-serif"
    ctx.fillText((session.user.name || "?").charAt(0).toUpperCase(), 300, 200)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 32px Inter, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(session.user.name || "", 300, 290)

    ctx.fillStyle = "#c9a84c"
    ctx.font = "18px Inter, sans-serif"
    ctx.fillText(`${session.user.faixa || ""} ${"★".repeat((session.user.grau || 0) + 1)}`, 300, 320)

    ctx.fillStyle = "rgba(255,255,255,0.6)"
    ctx.font = "16px Inter, sans-serif"
    ctx.fillText("Conquista Desbloqueada!", 300, 370)

    ctx.fillStyle = "rgba(255,255,255,0.4)"
    ctx.font = "12px Inter, sans-serif"
    ctx.fillText("Toda presença conta.", 300, 550)

    const link = document.createElement("a")
    link.download = `osstrack-conquista-${Date.now()}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  if (loading) return null

  return (
    <DashboardShell role="aluno">
      <div className="animate-fade-in space-y-4">
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 text-center">
          <div className="text-3xl mb-2">{isPremium ? "📱" : "🔒"}</div>
          <h3 className="font-bold">Compartilhar</h3>
          <p className="text-xs text-[var(--white-muted)]">
            {isPremium ? "Gere artes incríveis para compartilhar suas conquistas" : "Disponível apenas para assinantes Premium"}
          </p>
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
          <div className="bg-gradient-to-br from-black via-[#1a0a0a] to-black p-8 text-center relative overflow-hidden">
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
            </div>
          </div>
          <div className="p-6 text-center">
            <div className="text-xs text-[var(--white-muted)] mb-1">Conquista Desbloqueada</div>
            <div className="text-2xl font-black text-[var(--gold)] mb-4">🔥</div>
          </div>
          <div className="px-6 py-3 border-t border-[var(--dark-border)] flex justify-between items-center text-[11px]">
            <span className="font-extrabold">🥋 OssTrack</span>
            <span className="text-[var(--white-muted)]">Gracie Barra Recife</span>
          </div>
        </div>

        <button
          onClick={generateImage}
          className="w-full py-3.5 rounded-lg font-bold gradient-gold text-black transition-all"
        >
          {isPremium ? "📸 Gerar Arte para Compartilhar" : "🔓 Desbloquear com Premium"}
        </button>

        {isPremium && (
          <div className="flex gap-3">
            <button onClick={generateImage} className="flex-1 py-3 rounded-lg font-semibold text-sm border border-[var(--dark-border)] text-white hover:border-[var(--gold)] transition-all">
              💬 WhatsApp
            </button>
            <button onClick={generateImage} className="flex-1 py-3 rounded-lg font-semibold text-sm border border-[var(--dark-border)] text-white hover:border-[var(--gold)] transition-all">
              💼 LinkedIn
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </DashboardShell>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import QRCode from "qrcode"
import { toast } from "sonner"
import { PageTransition } from "@/components/ui/page-transition"
import { BackButton } from "@/components/ui/back-button"

export default function AlunoQRPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrData, setQrData] = useState("")
  const [loading, setLoading] = useState(true)

  async function renderQR(data: string, canvas: HTMLCanvasElement | null) {
    if (!canvas) return
    await QRCode.toCanvas(canvas, data, {
      width: 280, margin: 2,
      color: { dark: "#c9a84c", light: "#0d0d0d" },
    })
  }

  useEffect(() => {
    fetch("/api/checkin/qr")
      .then((r) => r.json())
      .then(async (data) => {
        setQrData(data.qrData)
        await renderQR(data.qrData, canvasRef.current)
        setLoading(false)
      })
      .catch(() => { toast.error("Erro ao carregar QR Code"); setLoading(false) })
  }, [])

  async function regenerarQR() {
    try {
      const r = await fetch("/api/checkin/qr")
      const data = await r.json()
      setQrData(data.qrData)
      await renderQR(data.qrData, canvasRef.current)
      toast.success("QR Code atualizado")
    } catch {
      toast.error("Erro ao atualizar QR Code")
    }
  }

  return (
    <DashboardShell role="aluno">
      <BackButton href="/dashboard/aluno/checkin" />
      <PageTransition>
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="glass-card p-5 text-center">
            <div className="text-3xl mb-2">📱</div>
            <h3 className="font-bold text-lg">Meu QR Code</h3>
            <p className="text-xs text-[var(--text-secondary)]">Mostre ao professor para fazer check-in</p>
          </div>

          <div className="glass-card p-4 sm:p-8 flex flex-col items-center">
            {loading ? (
              <div className="w-full max-w-[280px] aspect-square glass-card rounded-xl" />
            ) : (
              <div className="bg-black/20 p-4 rounded-xl border border-[var(--gold-dim)] max-w-full overflow-hidden">
                <canvas ref={canvasRef} className="mx-auto max-w-full h-auto" style={{ width: "min(280px, calc(100vw - 96px))", height: "auto" }} />
              </div>
            )}

            <p className="text-xs text-[var(--text-secondary)] mt-4 text-center max-w-xs">
              Seu QR Code é único e temporário. O professor escaneia e confirma sua presença automaticamente.
            </p>

            <button
              onClick={regenerarQR}
              aria-label="Atualizar QR Code"
              className="mt-5 btn btn-ghost text-xs px-4 py-2"
            >
              🔄 Atualizar QR Code
            </button>
          </div>
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

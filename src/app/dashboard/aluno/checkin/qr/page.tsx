"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import QRCode from "qrcode"

export default function AlunoQRPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrData, setQrData] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/checkin/qr")
      .then((r) => r.json())
      .then((data) => {
        setQrData(data.qrData)
        if (canvasRef.current) {
          QRCode.toCanvas(canvasRef.current, data.qrData, {
            width: 280, margin: 2,
            color: { dark: "#c9a84c", light: "#0d0d0d" },
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <DashboardShell role="aluno">
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">📱</div>
          <h3 className="font-bold text-lg">Meu QR Code</h3>
          <p className="text-xs text-[var(--white-muted)]">Mostre ao professor para fazer check-in</p>
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-8 flex flex-col items-center">
          {loading ? (
            <div className="w-[280px] h-[280px] bg-[var(--dark-border)] rounded-xl animate-pulse" />
          ) : (
            <div className="bg-[#0d0d0d] p-4 rounded-xl border border-[rgba(201,168,76,0.15)]">
              <canvas ref={canvasRef} className="mx-auto" />
            </div>
          )}

          <p className="text-xs text-[var(--white-muted)] mt-4 text-center max-w-xs">
            Seu QR Code é único e temporário. O professor escaneia e confirma sua presença automaticamente.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 text-xs px-4 py-2 rounded-xl border border-[var(--dark-border)] text-[var(--white-muted)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all"
          >
            🔄 Atualizar QR Code
          </button>
        </div>
      </div>
    </DashboardShell>
  )
}

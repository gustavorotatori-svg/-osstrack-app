"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import jsQR from "jsqr"

interface CameraScannerProps {
  onScan: (data: string) => void
  onError?: (error: string) => void
}

export function CameraScanner({ onScan, onError }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment")
  const streamRef = useRef<MediaStream | null>(null)
  const scanningRef = useRef(true)

  const stopCamera = useCallback(() => {
    scanningRef.current = false
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setActive(false)
  }, [])

  function scanFrame() {
    if (!scanningRef.current || !videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanFrame)
      return
    }
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) { requestAnimationFrame(scanFrame); return }
    ctx.drawImage(video, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" })
    if (code) {
      scanningRef.current = false
      stopCamera()
      onScan(code.data)
      return
    }
    requestAnimationFrame(scanFrame)
  }

  const startCamera = useCallback(async () => {
    setLoading(true)
    scanningRef.current = true
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute("playsinline", "true")
        await videoRef.current.play()
      }
      setActive(true)
      setLoading(false)
      requestAnimationFrame(scanFrame)
    } catch (err) {
      setLoading(false)
      const msg = err instanceof DOMException && err.name === "NotAllowedError"
        ? "Permissão de câmera negada. Verifique as configurações do navegador."
        : "Não foi possível acessar a câmera."
      onError?.(msg)
    }
  }, [facingMode, onError])

  useEffect(() => {
    return () => { scanningRef.current = false; if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()) } }
  }, [])

  function toggleCamera() {
    stopCamera()
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black">
      {!active && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <p className="text-sm text-[var(--white-muted)]">Aponte a câmera para o QR Code do aluno</p>
          <button onClick={startCamera} className="btn-gold px-6 py-3 text-sm">
            Ativar Câmera
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            <span className="text-xs text-[var(--white-muted)]">Acessando câmera...</span>
          </div>
        </div>
      )}

      {active && (
        <div className="relative">
          <video ref={videoRef} className="w-full h-auto min-h-[300px] object-cover" muted playsInline />
          <canvas ref={canvasRef} className="hidden" />

          {/* scanner overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 relative">
              <div className="absolute inset-0 border-2 border-[var(--gold)]/50 rounded-2xl" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--gold)] rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--gold)] rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[var(--gold)] rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--gold)] rounded-br-xl" />
              <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent animate-scan-line" />
            </div>
          </div>

          <p className="absolute bottom-3 left-0 right-0 text-center text-[10px] text-white/60 bg-black/50 py-1.5 mx-4 rounded-lg">
            Aproxime o QR Code do aluno
          </p>

          <button
            onClick={stopCamera}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white/70 hover:text-white"
          >
            ✕
          </button>

          <button
            onClick={toggleCamera}
            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white/70 hover:text-white"
            title="Virar câmera"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { CameraScanner } from "@/components/scanner/camera-scanner"

export default function DonoEscanearPage() {
  const [input, setInput] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const [msg, setMsg] = useState("")
  const [alunoNome, setAlunoNome] = useState("")
  const [horario, setHorario] = useState("")

  async function confirmarPresenca(alunoId?: string) {
    const id = alunoId || input.trim()
    if (!id) return
    setStatus("loading")
    try {
      const res = await fetch("/api/presenca/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      })
      if (res.ok) {
        const data = await res.json()
        setStatus("ok")
        setAlunoNome(data.alunoNome)
        setHorario(data.horario)
        setMsg(`✅ Presença confirmada — ${data.alunoNome} às ${data.horario}`)
      } else {
        const err = await res.json()
        setStatus("error")
        setMsg(err.error || "❌ Aluno não encontrado")
      }
    } catch {
      setStatus("error")
      setMsg("❌ Erro ao confirmar")
    }
    setTimeout(() => { setStatus("idle"); setInput(""); setAlunoNome("") }, 4000)
  }

  function handleScan(data: string) {
    try {
      const parsed = JSON.parse(data)
      confirmarPresenca(parsed.userId || parsed.alunoId || parsed.id)
    } catch {
      confirmarPresenca(data)
    }
  }

  return (
    <DashboardShell role="dono">
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">📷</div>
          <h3 className="font-bold text-lg">Escanear QR Code</h3>
          <p className="text-xs text-[var(--white-muted)]">Aponte a câmera para o QR Code do aluno ou cole abaixo</p>
        </div>

        <CameraScanner onScan={handleScan} onError={(e) => { setStatus("error"); setMsg(e) }} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--dark-border)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--dark-bg)] px-3 text-[var(--white-muted)]">ou cole manualmente</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input-premium w-full text-sm"
            placeholder="Cole o QR Code ou ID do aluno..."
          />
          <button
            onClick={() => confirmarPresenca()}
            disabled={status === "loading" || !input.trim()}
            className={`w-full mt-3 py-3 rounded-xl font-bold text-sm transition-all ${
              status === "ok" ? "bg-emerald-600 text-white"
              : status === "error" ? "bg-red-600 text-white"
              : "btn-gold"
            }`}
          >
            {status === "loading" ? "⏳ Confirmando..." : status === "ok" ? msg : status === "error" ? msg : "✅ Confirmar Presença"}
          </button>
        </div>

        {status === "ok" && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center animate-scale-in">
            <div className="text-2xl mb-1">✅</div>
            <p className="font-bold text-emerald-500">Presença confirmada!</p>
            {alunoNome && <p className="text-xs text-[var(--white-muted)] mt-1">{alunoNome} · {horario}</p>}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

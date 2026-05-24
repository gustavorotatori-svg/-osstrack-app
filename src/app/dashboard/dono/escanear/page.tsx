"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/shell"

export default function DonoEscanearPage() {
  const [input, setInput] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const [msg, setMsg] = useState("")

  async function confirmarPresenca() {
    if (!input.trim()) return
    setStatus("loading")
    try {
      const res = await fetch("/api/presenca/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alunoId: input, acao: "confirmar" }),
      })
      if (res.ok) { setStatus("ok"); setMsg("✅ Presença confirmada!") }
      else { setStatus("error"); setMsg("❌ Aluno não encontrado") }
    } catch { setStatus("error"); setMsg("❌ Erro ao confirmar") }
    setTimeout(() => { setStatus("idle"); setInput("") }, 3000)
  }

  return (
    <DashboardShell role="dono">
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">📷</div>
          <h3 className="font-bold text-lg">Confirmar Presença</h3>
          <p className="text-xs text-[var(--white-muted)]">Confirme presença pelo ID do aluno ou QR Code</p>
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-6">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input-premium w-full text-sm"
            placeholder="ID do aluno ou código QR..."
          />
          <button onClick={confirmarPresenca} disabled={status === "loading" || !input.trim()}
            className={`w-full mt-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
              status === "ok" ? "bg-emerald-600 text-white"
              : status === "error" ? "bg-red-600 text-white"
              : "btn-gold"
            }`}
          >
            {status === "loading" ? "⏳..." : status === "ok" ? msg : status === "error" ? msg : "✅ Confirmar"}
          </button>
        </div>
      </div>
    </DashboardShell>
  )
}

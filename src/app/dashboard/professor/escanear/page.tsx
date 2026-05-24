"use client"

import { useState, useRef } from "react"
import { DashboardShell } from "@/components/dashboard/shell"

export default function EscanearPage() {
  const [input, setInput] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const [msg, setMsg] = useState("")

  async function confirmarPresenca() {
    if (!input.trim()) return
    setStatus("loading")
    try {
      const parsed = JSON.parse(input)
      const res = await fetch("/api/presenca/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presencaId: parsed.presencaId || parsed.userId, acao: "confirmar" }),
      })
      if (res.ok) {
        setStatus("ok")
        setMsg(`✅ Presença confirmada para ${parsed.nome || "aluno"}!`)
      } else {
        setStatus("error")
        setMsg("❌ Erro ao confirmar presença")
      }
    } catch {
      // Manual input fallback
      const res = await fetch("/api/presenca/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alunoId: input, acao: "confirmar" }),
      })
      if (res.ok) {
        setStatus("ok")
        setMsg("✅ Presença confirmada!")
      } else {
        setStatus("error")
        setMsg("❌ Aluno não encontrado")
      }
    }
    setTimeout(() => { setStatus("idle"); setInput("") }, 3000)
  }

  return (
    <DashboardShell role="professor">
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">📷</div>
          <h3 className="font-bold text-lg">Escanear QR Code</h3>
          <p className="text-xs text-[var(--white-muted)]">Cole o código QR do aluno para confirmar presença</p>
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input-premium w-full h-32 text-xs font-mono"
            placeholder="Cole aqui o código QR copiado pelo aluno..."
          />

          <button
            onClick={confirmarPresenca}
            disabled={status === "loading" || !input.trim()}
            className={`w-full mt-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
              status === "ok" ? "bg-emerald-600 text-white"
              : status === "error" ? "bg-red-600 text-white"
              : "btn-gold"
            }`}
          >
            {status === "loading" ? "⏳ Confirmando..." : status === "ok" ? msg : status === "error" ? msg : "✅ Confirmar Presença"}
          </button>
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-5">
          <h4 className="font-bold text-sm mb-2">Como funciona</h4>
          <ol className="text-xs text-[var(--white-muted)] space-y-2 list-decimal list-inside">
            <li>O aluno acessa "Meu QR Code" no app</li>
            <li>Copia ou mostra o código gerado</li>
            <li>Você cola aqui e confirma a presença</li>
            <li>A presença é registrada automaticamente</li>
          </ol>
        </div>
      </div>
    </DashboardShell>
  )
}

"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { CameraScanner } from "@/components/scanner/camera-scanner"
import { useT } from "@/lib/use-t"
import { PageTransition } from "@/components/ui/page-transition"

export default function EscanearPage() {
  const t = useT("professor.escanear")
  const [input, setInput] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const [msg, setMsg] = useState("")
  const [alunoNome, setAlunoNome] = useState("")
  const [horario, setHorario] = useState("")

  async function confirmarPresenca(alunoId: string) {
    if (!alunoId) return
    setStatus("loading")
    try {
      const res = await fetch("/api/presenca/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: alunoId }),
      })
      if (res.ok) {
        const data = await res.json()
        setStatus("ok")
        setAlunoNome(data.alunoNome)
        setHorario(data.horario)
        setMsg(`${t("presencaConfirmada")} ${data.alunoNome} — ${data.horario}`)
      } else {
        const err = await res.json()
        setStatus("error")
        setMsg(err.error || t("erroConfirmar"))
      }
    } catch {
      setStatus("error")
      setMsg(t("erroConfirmar"))
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
    <DashboardShell role="professor">
      <PageTransition>
        <div className="max-w-5xl mx-auto space-y-4">
        <div className="text-center py-4">
          <div className="text-3xl mb-2">📷</div>
          <h3 className="font-bold text-lg">{t("title")}</h3>
          <p className="text-xs text-[var(--text-secondary)]">{t("subtitle")}</p>
        </div>

        <CameraScanner onScan={handleScan} onError={(e) => { setStatus("error"); setMsg(e) }} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--bg)] px-3 text-[var(--text-secondary)]">{t("ouCole")}</span>
          </div>
        </div>

        <div className="glass-card p-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="input w-full h-24 text-xs font-mono"
            placeholder={t("placeholder")}
          />

          <button
            onClick={() => confirmarPresenca(input.trim())}
            disabled={status === "loading" || !input.trim()}
            className={`w-full mt-3 py-3 rounded-xl font-bold text-sm transition-all ${
              status === "ok" ? "bg-emerald-600 text-white"
              : status === "error" ? "bg-red-600 text-white"
              : "btn btn-primary"
            }`}
          >
            {status === "loading" ? t("confirmando") : status === "ok" ? msg : status === "error" ? msg : t("confirmar")}
          </button>
        </div>

        {status === "ok" && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center animate-scale-in">
            <div className="text-2xl mb-1">✅</div>
            <p className="font-bold text-emerald-500">{t("presencaConfirmada")}</p>
            {alunoNome && <p className="text-xs text-[var(--text-secondary)] mt-1">{alunoNome} · {horario}</p>}
          </div>
        )}

        <div className="glass-card p-5">
          <h4 className="font-bold text-sm mb-2">{t("comoFunciona")}</h4>
          <ol className="text-xs text-[var(--text-secondary)] space-y-2 list-decimal list-inside">
            <li>{t("passo1")}</li>
            <li>{t("passo2")}</li>
            <li>{t("passo3")}</li>
            <li>{t("passo4")}</li>
          </ol>
        </div>
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

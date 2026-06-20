"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { CameraScanner } from "@/components/scanner/camera-scanner"
import { useT } from "@/lib/use-t"
import { PageTransition } from "@/components/ui/page-transition"
import { toast } from "sonner"

export default function DonoEscanearPage() {
  const t = useT("dono.escanear")
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
        setMsg(`${t("presencaConfirmada")} ${data.alunoNome} ${data.horario}`)
      } else {
        const err = await res.json()
        setStatus("error")
        setMsg(err.error || t("alunoNaoEncontrado"))
        toast.error(err.error || t("alunoNaoEncontrado"))
      }
    } catch {
      setStatus("error")
      setMsg(t("erroConfirmar"))
      toast.error(t("erroConfirmar"))
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
      <PageTransition>
      <div className="space-y-4">
        <div className="glass-card p-5 text-center">
          <div className="text-3xl mb-2">📷</div>
          <h3 className="font-bold text-lg">{t("title")}</h3>
          <p className="text-xs text-[var(--white-muted)]">{t("subtitle")}</p>
        </div>

        <CameraScanner onScan={handleScan} onError={(e) => { setStatus("error"); setMsg(e); toast.error(e) }} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--dark-border)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--dark-bg)] px-3 text-[var(--white-muted)]">{t("ouCole")}</span>
          </div>
        </div>

        {status === "loading" ? (
          <div className="space-y-3">
            <div className="h-12 w-full glass-card rounded-lg" />
            <div className="h-12 w-full glass-card rounded-xl" />
          </div>
        ) : (
          <div className="glass-card p-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input-field w-full text-sm"
              placeholder={t("placeholder")}
            />
            <button
              onClick={() => confirmarPresenca()}
              disabled={!input.trim()}
              className={`w-full mt-3 py-3 rounded-xl font-bold text-sm transition-all ${
                status === "ok" ? "bg-emerald-600 text-white"
                : status === "error" ? "bg-red-600 text-white"
                : "btn-gold"
              }`}
            >
              {status === "ok" ? msg : status === "error" ? msg : t("confirmar")}
            </button>
          </div>
        )}

        {status === "ok" && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center animate-scale-in">
            <div className="text-2xl mb-1">✅</div>
            <p className="font-bold text-emerald-500">{t("presencaConfirmada")}</p>
            {alunoNome && <p className="text-xs text-[var(--white-muted)] mt-1">{alunoNome} · {horario}</p>}
          </div>
        )}
      </div>
      </PageTransition>
    </DashboardShell>
  )
}

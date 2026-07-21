"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { CameraScanner } from "@/components/scanner/camera-scanner"
import { useT } from "@/lib/use-t"
import { PageTransition } from "@/components/ui/page-transition"
import { toast } from "sonner"
import { BackButton } from "@/components/ui/back-button"

type AlunoResumo = {
  id: string
  nome: string
  faixa: string
  grau: number
}

export default function DonoEscanearPage() {
  const t = useT("dono.escanear")
  const [input, setInput] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const [msg, setMsg] = useState("")
  const [alunoNome, setAlunoNome] = useState("")
  const [horario, setHorario] = useState("")
  const [modo, setModo] = useState<"normal" | "wellhub">("normal")
  const [wellhubAtivo, setWellhubAtivo] = useState(false)

  // association flow state
  const [associateWellhubId, setAssociateWellhubId] = useState("")
  const [alunosList, setAlunosList] = useState<AlunoResumo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searching, setSearching] = useState(false)
  const [associating, setAssociating] = useState(false)

  useEffect(() => {
    fetch("/api/academia").then(r => r.json()).then(d => setWellhubAtivo(d.wellhubAtivo || false)).catch(() => {})
  }, [])

  async function confirmarPresenca(alunoId?: string) {
    const id = alunoId || input.trim()
    if (!id) return
    setStatus("loading")
    setMsg("")
    try {
      const endpoint = modo === "wellhub" ? "/api/presenca/wellhub" : "/api/presenca/confirm"
      const body = modo === "wellhub" ? { wellhubId: id } : { userId: id }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        setStatus("ok")
        setAlunoNome(data.alunoNome)
        setHorario(data.horario)
        setMsg(`${modo === "wellhub" ? "Check-in Wellhub: " : t("presencaConfirmada")} ${data.alunoNome} ${data.horario}`)
        setTimeout(() => { setStatus("idle"); setInput(""); setAlunoNome("") }, 4000)
        return
      }

      const err = await res.json()

      if (err.error === "WELLHUB_ID_NOT_ASSOCIATED") {
        setAssociateWellhubId(err.wellhubId || id)
        setSearchTerm("")
        setAlunosList([])
        setStatus("idle")
        setMsg("")
        toast.info("Check-in validado no Wellhub! Associe a um aluno.")
        return
      }

      setStatus("error")
      setMsg(err.error || t("alunoNaoEncontrado"))
      toast.error(err.error || t("alunoNaoEncontrado"))
      setTimeout(() => { setStatus("idle"); setInput(""); setAlunoNome("") }, 4000)
    } catch {
      setStatus("error")
      setMsg(t("erroConfirmar"))
      toast.error(t("erroConfirmar"))
      setTimeout(() => { setStatus("idle"); setInput(""); setAlunoNome("") }, 4000)
    }
  }

  async function buscarAlunos() {
    if (!searchTerm.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`/api/dashboard/dono/alunos?busca=${encodeURIComponent(searchTerm)}`)
      if (res.ok) {
        const data = await res.json()
        setAlunosList(data.alunos || [])
      }
    } catch { } finally {
      setSearching(false)
    }
  }

  async function associarEConfirmar(alunoId: string, alunoNome: string) {
    if (!associateWellhubId) return
    setAssociating(true)
    try {
      const res = await fetch("/api/usuarios/wellhub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alunoId, wellhubId: associateWellhubId }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Erro ao associar")
        return
      }

      const presencaRes = await fetch("/api/presenca/wellhub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wellhubId: associateWellhubId, skipValidation: true }),
      })

      if (presencaRes.ok) {
        const data = await presencaRes.json()
        setStatus("ok")
        setAlunoNome(alunoNome)
        setHorario(data.horario)
        setMsg(`Check-in Wellhub registrado: ${alunoNome} ${data.horario}`)
      } else {
        toast.success(`Wellhub ID associado a ${alunoNome}! Faça o check-in novamente.`)
      }
      setAssociateWellhubId("")
      setAlunosList([])
    } catch {
      toast.error("Erro ao associar Wellhub ID")
    } finally {
      setAssociating(false)
    }
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
      <BackButton href="/dashboard/dono" />
      <PageTransition>
      <div className="space-y-4">
        <div className="glass-card p-5 text-center">
          <div className="text-3xl mb-2">📷</div>
          <h3 className="font-bold text-lg">{t("title")}</h3>
          <p className="text-xs text-[var(--text-secondary)]">{t("subtitle")}</p>
        </div>

        {wellhubAtivo && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setModo("normal")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                modo === "normal" ? "btn-gold" : "bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)]"
              }`}
            >
              🥋 Normal
            </button>
            <button
              type="button"
              onClick={() => setModo("wellhub")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                modo === "wellhub" ? "bg-emerald-600 text-white" : "bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)]"
              }`}
            >
              🟢 Wellhub
            </button>
          </div>
        )}

        <CameraScanner onScan={handleScan} onError={(e) => { setStatus("error"); setMsg(e); toast.error(e) }} />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--bg)] px-3 text-[var(--text-secondary)]">{t("ouCole")}</span>
          </div>
        </div>

        {status === "loading" ? (
          <div className="space-y-3">
            <div className="h-12 w-full glass-card rounded-lg" />
            <div className="h-12 w-full glass-card rounded-xl" />
          </div>
        ) : associateWellhubId ? (
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              Check-in validado no Wellhub! ID: {associateWellhubId}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">Busque o aluno para associar este Wellhub ID:</p>
            <div className="flex gap-2">
              <input
                type="text"
                className="input-field flex-1 text-sm"
                placeholder="Nome do aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarAlunos()}
              />
              <button
                type="button"
                onClick={buscarAlunos}
                disabled={searching || !searchTerm.trim()}
                className="btn btn-primary px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {searching ? "..." : "Buscar"}
              </button>
            </div>
            {searching && <p className="text-xs text-[var(--text-muted)]">Buscando...</p>}
            {alunosList.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1">
                {alunosList.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => associarEConfirmar(a.id, a.nome)}
                    disabled={associating}
                    className="w-full flex items-center justify-between p-3 rounded-lg text-sm hover:bg-white/5 transition-all disabled:opacity-50"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <span className="font-semibold">{a.nome}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{a.faixa} · {a.grau + 1}º</span>
                  </button>
                ))}
              </div>
            )}
            {!searching && searchTerm && alunosList.length === 0 && (
              <p className="text-xs text-[var(--text-muted)]">Nenhum aluno encontrado</p>
            )}
          </div>
        ) : (
          <div className="glass-card p-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input-field w-full text-sm"
              placeholder={modo === "wellhub" ? "ID do Wellhub (gympass_id)..." : t("placeholder")}
              onKeyDown={(e) => e.key === "Enter" && confirmarPresenca()}
            />
            <button
              onClick={() => confirmarPresenca()}
              disabled={!input.trim()}
              className={`w-full mt-3 py-3 rounded-xl font-bold text-sm transition-all ${
                status === "ok" ? "bg-emerald-600 text-white"
                : status === "error" ? "bg-red-600 text-white"
                : modo === "wellhub" ? "bg-emerald-600 text-white hover:bg-emerald-500"
                : "btn-gold"
              }`}
            >
              {status === "ok" ? msg : status === "error" ? msg : modo === "wellhub" ? "Check-in Wellhub" : t("confirmar")}
            </button>
          </div>
        )}

        {status === "ok" && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center animate-scale-in">
            <div className="text-2xl mb-1">✅</div>
            <p className="font-bold text-emerald-500">{modo === "wellhub" ? "Check-in Wellhub" : t("presencaConfirmada")}</p>
            {alunoNome && <p className="text-xs text-[var(--text-secondary)] mt-1">{alunoNome} · {horario}</p>}
          </div>
        )}
      </div>
      </PageTransition>
    </DashboardShell>
  )
}

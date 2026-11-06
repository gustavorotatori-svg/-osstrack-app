"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { CalendarDays, CheckCircle, Pencil, Target, TrendingUp, X } from "lucide-react"
import { useT } from "@/lib/use-t"

type MetaSemanal = { aulasFeitas: number; aulasAlvo: number; concluida: boolean }

export function MetaSemanalCard() {
  const t = useT("gamification")
  const [meta, setMeta] = useState<MetaSemanal | null>(null)
  const [editando, setEditando] = useState(false)
  const [aulasAlvo, setAulasAlvo] = useState(3)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(false)

  const carregarMeta = useCallback(async () => {
    try {
      const response = await fetch("/api/metasemanal")
      if (!response.ok) return
      const data: MetaSemanal = await response.json()
      setMeta(data)
      setAulasAlvo(data.aulasAlvo)
    } catch (error) {
      console.error("meta semanal", error)
    }
  }, [])

  useEffect(() => {
    const initialLoad = window.setTimeout(() => { void carregarMeta() }, 0)
    window.addEventListener("focus", carregarMeta)
    return () => {
      window.clearTimeout(initialLoad)
      window.removeEventListener("focus", carregarMeta)
    }
  }, [carregarMeta])

  async function salvarMeta() {
    setSalvando(true)
    setErro(false)
    try {
      const response = await fetch("/api/metasemanal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aulasAlvo }),
      })
      if (!response.ok) throw new Error("Falha ao salvar meta")
      setMeta(await response.json())
      setEditando(false)
    } catch {
      setErro(true)
    } finally {
      setSalvando(false)
    }
  }

  if (!meta) return null

  const progresso = Math.min(meta.aulasFeitas / Math.max(1, meta.aulasAlvo), 1)

  return (
    <section className="glass-card p-5" aria-labelledby="meta-semanal-title">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <TrendingUp className="w-4 h-4 text-[var(--gold)] shrink-0" />
          <h2 id="meta-semanal-title" className="section-header mb-0">{t("progressoSemanal.title")}</h2>
        </div>
        <span className="badge shrink-0">{t("metaSemanalBadge")}</span>
      </div>

      <div className={`relative overflow-hidden rounded-xl border p-3.5 transition-all ${meta.concluida ? "border-emerald-500/30 bg-emerald-500/5" : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]"}`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${meta.concluida ? "bg-emerald-500/20 text-emerald-400" : "bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)]"}`}>
            {meta.concluida ? <CheckCircle className="w-4 h-4" /> : <Target className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sm">
                {t("metaSemanalAulas").replace("{atual}", String(meta.aulasFeitas)).replace("{max}", String(meta.aulasAlvo))}
              </span>
              <button
                type="button"
                onClick={() => { setAulasAlvo(meta.aulasAlvo); setEditando((value) => !value); setErro(false) }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--gold)] hover:text-amber-400 transition-colors"
                aria-expanded={editando}
              >
                {editando ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                {editando ? t("metaSemanalCancelar") : t("metaSemanalEditar")}
              </button>
            </div>
            <div
              className="mt-2 h-2 rounded-full bg-[var(--border)] overflow-hidden"
              role="progressbar"
              aria-label={t("progressoSemanal.title")}
              aria-valuemin={0}
              aria-valuemax={meta.aulasAlvo}
              aria-valuenow={Math.min(meta.aulasFeitas, meta.aulasAlvo)}
            >
              <div className="h-full rounded-full bg-gradient-to-r from-[var(--gold-dim)] to-[var(--gold)] transition-all" style={{ width: `${progresso * 100}%` }} />
            </div>
            <p className="mt-1.5 text-[10px] text-[var(--text-secondary)]">
              {meta.concluida ? t("progressoSemanal.concluida") : t("progressoSemanal.faltamTreinos").replace("{n}", String(Math.max(0, meta.aulasAlvo - meta.aulasFeitas))).replace("{s}", meta.aulasAlvo - meta.aulasFeitas === 1 ? "" : "s")}
            </p>

            {editando && (
              <div className="mt-3 rounded-lg border border-[var(--border)] p-3 space-y-2" aria-label={t("metaSemanalDica")}>
                <label htmlFor="meta-semanal-aulas" className="block text-xs font-semibold">{t("metaSemanalAlvo")}</label>
                <div className="flex items-center gap-2">
                  <select
                    id="meta-semanal-aulas"
                    value={aulasAlvo}
                    onChange={(event) => setAulasAlvo(Number(event.target.value))}
                    className="input-field min-w-0 flex-1"
                  >
                    {Array.from({ length: 7 }, (_, index) => index + 1).map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                  <button type="button" onClick={salvarMeta} disabled={salvando} className="btn-gold rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-50">
                    {salvando ? "…" : t("metaSemanalSalvar")}
                  </button>
                </div>
                <p className="text-[10px] text-[var(--text-muted)]">{t("metaSemanalDica")}</p>
                {erro && <p role="alert" className="text-xs text-red-400">{t("metaSemanalErroSalvar")}</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      <Link href="/dashboard/aluno/agenda" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--gold)] hover:text-amber-400 transition-colors">
        <CalendarDays className="w-3.5 h-3.5" /> {t("metaSemanalAgendar")}
      </Link>
    </section>
  )
}

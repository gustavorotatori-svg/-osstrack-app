"use client"

import { useState, useEffect } from "react"
import { useT } from "@/lib/use-t"
import { CrownIcon } from "@/components/ui/icons"
import { useRouter } from "next/navigation"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"

type MestreData = {
  nome: string
  faixa: string
  avatar: string | null
  totalAulas: number
  mes: number
  ano: number
} | null

const CATEGORIAS = ["adulto", "master", "infantil"]
const CATEGORIA_LABELS: Record<string, string> = { adulto: "🥋 Adulto", master: "🏆 Master", infantil: "⭐ Infantil" }
const CATEGORIA_COLORS: Record<string, string> = { adulto: "#60a5fa", master: "#a855f7", infantil: "#f97316" }

export function MestreDoMesCard() {
  const t = useT("gamification")
  const router = useRouter()
  const [mestres, setMestres] = useState<Record<string, MestreData>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/mestredomes/meu")
      .then((r) => r.json())
      .then((d) => { setMestres(d.mestres || {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null

  const hasAny = Object.values(mestres).some((m) => m !== null)

  return (
    <div className="glass-card-accent p-5" style={{"--accent-color": "var(--gold)"} as React.CSSProperties}>
      <div className="flex items-center gap-2 mb-4">
        <CrownIcon className="w-5 h-5 text-[var(--gold)]" />
        <span className="section-header mb-0">{t("alunoDoMes.title")}</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {CATEGORIAS.map((cat) => {
          const m = mestres[cat]
          return (
            <div
              key={cat}
              className="relative rounded-xl p-3.5 text-center overflow-hidden border border-[rgba(255,255,255,0.03)]"
              style={{ background: `rgba(255,255,255,0.02)` }}
            >
              <div
                className="absolute top-0 left-0 w-full h-[2px] opacity-60"
                style={{ background: CATEGORIA_COLORS[cat] }}
              />
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: CATEGORIA_COLORS[cat] }}>
                {CATEGORIA_LABELS[cat]}
              </div>
              {m ? (
                <>
                  <p className="text-sm font-extrabold truncate text-[var(--gold)]">{m.nome}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${getBeltColor(m.faixa)}`}>
                    {getBeltEmoji(m.faixa)} {m.faixa}
                  </span>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-1">{t("alunoDoMes.aulas").replace("{n}", String(m.totalAulas))}</p>
                </>
              ) : (
                <p className="text-xs text-[var(--text-muted)]">{t("alunoDoMes.nenhumAluno")}</p>
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.05)] text-center">
        <button
          onClick={() => router.push("/dashboard/aluno/ranking")}
          className="inline-flex items-center gap-1 text-xs text-[var(--gold)] font-semibold hover:underline"
        >
          Ver ranking completo →
        </button>
      </div>
    </div>
  )
}
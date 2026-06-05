"use client"

import { useT } from "@/lib/use-t"
import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { TreinoTimer } from "@/components/treino/treino-timer"

export default function TreinoPage() {
  const t = useT("aluno.treino")
  const [treinandoAgora, setTreinandoAgora] = useState<{ nome: string; faixa: string }[]>([])

  useEffect(() => {
    fetch("/api/treino")
      .then((r) => r.json())
      .then((data) => setTreinandoAgora(data.treinando || []))
      .catch(() => {})
  }, [])

  return (
    <DashboardShell role="aluno">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="text-center">
          <div className="text-3xl mb-1">🥊</div>
          <h2 className="font-extrabold text-lg">{t("title")}</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{t("subtitle")}</p>
        </div>

        <div className="surface p-6">
          <TreinoTimer />
        </div>

        {treinandoAgora.length > 0 && (
          <div className="surface p-5">
            <h3 className="font-bold text-sm tracking-tight mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              {t("treinandoAgora")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {treinandoAgora.map((p, i) => (
                <div key={i} className="flex items-center gap-2 bg-[var(--red-dim)] border border-[var(--red)]/20 rounded-xl px-3 py-1.5 text-xs">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="font-semibold">{p.nome}</span>
                  <span className="text-[var(--text-secondary)]">· {p.faixa}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

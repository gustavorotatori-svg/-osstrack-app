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
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-6 text-center relative overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-36 h-36 bg-[var(--red)]/5 rounded-full blur-3xl" />
          <div className="text-3xl mb-1">🥊</div>
          <h2 className="font-extrabold text-lg">{t("title")}</h2>
          <p className="text-xs text-[var(--white-muted)] mt-0.5">{t("subtitle")}</p>
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-6 hover-card">
          <TreinoTimer />
        </div>

        {treinandoAgora.length > 0 && (
          <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5">
            <h3 className="font-bold text-sm tracking-tight mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              {t("treinandoAgora")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {treinandoAgora.map((p, i) => (
                <div key={i} className="flex items-center gap-2 bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.15)] rounded-xl px-3 py-1.5 text-xs">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="font-semibold">{p.nome}</span>
                  <span className="text-[var(--white-muted)]">· {p.faixa}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

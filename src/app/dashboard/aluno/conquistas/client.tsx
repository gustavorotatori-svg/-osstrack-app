"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { useSession } from "next-auth/react"

type Props = {
  conquistas: { id: string; nome: string; icone: string; descricao: string; desbloqueada: boolean }[]
}

export function AchievementsClient({ conquistas }: Props) {
  const desbloqueadas = conquistas.filter((c) => c.desbloqueada)
  const bloqueadas = conquistas.filter((c) => !c.desbloqueada)

  return (
    <DashboardShell role="aluno">
      <div className="animate-fade-in space-y-4">
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 text-center">
          <div className="text-3xl mb-2">🎖️</div>
          <h3 className="font-bold">Conquistas</h3>
          <p className="text-xs text-[var(--white-muted)]">
            {desbloqueadas.length}/{conquistas.length} desbloqueadas
          </p>
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <h3 className="font-bold mb-3">🏅 Desbloqueadas</h3>
          <div className="grid grid-cols-4 gap-3">
            {desbloqueadas.map((c) => (
              <div key={c.id} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[rgba(201,168,76,0.2)] to-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)] flex items-center justify-center text-xl mx-auto mb-1">
                  {c.icone}
                </div>
                <div className="text-[9px] text-[var(--gold)] font-medium">{c.nome}</div>
              </div>
            ))}
            {desbloqueadas.length === 0 && (
              <p className="text-sm text-[var(--white-muted)] col-span-4 text-center py-4">Nenhuma ainda</p>
            )}
          </div>
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <h3 className="font-bold mb-3">🔒 A Desbloquear</h3>
          <div className="grid grid-cols-4 gap-3">
            {bloqueadas.map((c) => (
              <div key={c.id} className="text-center opacity-40 grayscale">
                <div className="w-12 h-12 rounded-full bg-[var(--dark-border)] flex items-center justify-center text-xl mx-auto mb-1">
                  {c.icone}
                </div>
                <div className="text-[9px] text-[var(--white-muted)]">{c.nome}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <h3 className="font-bold mb-3">🔥 Sequência de Treinos</h3>
          <div className="flex gap-3 justify-center">
            {["🥇", "🥈", "🥉"].map((m, i) => (
              <div key={i} className="text-center">
                <div className={`text-3xl ${i > 0 ? "opacity-40 grayscale" : ""}`}>{m}</div>
                <div className="text-[10px] text-[var(--white-muted)]">
                  {["Ouro", "Prata", "Bronze"][i]}<br />{[10, 7, 5][i]} dias
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

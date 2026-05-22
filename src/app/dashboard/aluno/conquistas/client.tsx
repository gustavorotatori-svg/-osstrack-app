"use client"

import { DashboardShell } from "@/components/dashboard/shell"

type Props = {
  conquistas: { id: string; nome: string; icone: string; descricao: string; desbloqueada: boolean }[]
}

export function AchievementsClient({ conquistas }: Props) {
  const desbloqueadas = conquistas.filter((c) => c.desbloqueada)
  const bloqueadas = conquistas.filter((c) => !c.desbloqueada)

  return (
    <DashboardShell role="aluno">
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">🎖️</div>
          <h3 className="font-bold">Conquistas</h3>
          <p className="text-xs text-[var(--white-muted)] mt-1">
            {desbloqueadas.length}/{conquistas.length} desbloqueadas
          </p>
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5">
          <h3 className="font-bold text-sm tracking-tight mb-4">🏅 Desbloqueadas</h3>
          <div className="grid grid-cols-4 gap-4">
            {desbloqueadas.map((c) => (
              <div key={c.id} className="text-center group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[rgba(201,168,76,0.2)] to-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.25)] flex items-center justify-center text-xl mx-auto mb-1.5 transition-all group-hover:scale-110 group-hover:shadow-lg">
                  {c.icone}
                </div>
                <div className="text-[9px] text-[var(--gold)] font-medium leading-tight">{c.nome}</div>
              </div>
            ))}
            {desbloqueadas.length === 0 && (
              <p className="text-sm text-[var(--white-muted)] col-span-4 text-center py-6">Nenhuma conquista ainda. Continue treinando!</p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5">
          <h3 className="font-bold text-sm tracking-tight mb-4">🔒 A Desbloquear</h3>
          <div className="grid grid-cols-4 gap-4">
            {bloqueadas.map((c) => (
              <div key={c.id} className="text-center opacity-30 grayscale">
                <div className="w-14 h-14 rounded-2xl bg-[var(--dark-border)] flex items-center justify-center text-xl mx-auto mb-1.5">
                  {c.icone}
                </div>
                <div className="text-[9px] text-[var(--white-muted)] leading-tight">{c.nome}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5">
          <h3 className="font-bold text-sm tracking-tight mb-4">🔥 Sequência de Treinos</h3>
          <div className="flex gap-5 justify-center items-end">
            {[
              { medal: "🥇", label: "Ouro", days: 10 },
              { medal: "🥈", label: "Prata", days: 7 },
              { medal: "🥉", label: "Bronze", days: 5 },
            ].map((m, i) => (
              <div key={i} className="text-center">
                <div className={`text-4xl mb-1.5 ${i > 0 ? "opacity-30 grayscale" : "animate-float"}`}>{m.medal}</div>
                <div className="text-[10px] text-[var(--white-muted)]">
                  {m.label}<br />{m.days} dias
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

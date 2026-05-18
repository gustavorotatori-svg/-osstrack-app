"use client"

import { DashboardShell } from "@/components/dashboard/shell"

export default function GraduacoesClient() {
  const graduacoes = [
    { faixa: "Branca", graus: 4, aulasPorGrau: 20, aulasProxFx: 100 },
    { faixa: "Azul", graus: 4, aulasPorGrau: 25, aulasProxFx: 200 },
    { faixa: "Roxa", graus: 4, aulasPorGrau: 30, aulasProxFx: 300 },
    { faixa: "Marrom", graus: 4, aulasPorGrau: 35, aulasProxFx: 400 },
    { faixa: "Preta", graus: 6, aulasPorGrau: 40, aulasProxFx: null },
  ]

  return (
    <DashboardShell role="dono">
      <div className="animate-fade-in space-y-4">
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <h3 className="font-bold mb-3">⚙️ Regras de Graduação</h3>
          <div className="flex gap-1 bg-[var(--dark-border)] rounded-lg p-1 mb-4">
            <button className="flex-1 px-4 py-2 rounded-md text-xs font-semibold bg-[var(--gold)] text-black">Adulto</button>
            <button className="flex-1 px-4 py-2 rounded-md text-xs font-semibold text-[var(--white-muted)]">Infantil</button>
          </div>

          {graduacoes.map((g) => (
            <div key={g.faixa} className="bg-black border border-[var(--dark-border)] rounded-xl p-4 mb-2">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm">{["⬜","🟦","🟪","🟫","⬛"][graduacoes.indexOf(g)]} {g.faixa}</h4>
              </div>
              <p className="text-xs text-[var(--white-muted)]">{g.graus} graus · {g.aulasPorGrau} aulas por grau</p>
              {g.aulasProxFx ? (
                <p className="text-xs text-[var(--white-muted)]">{g.aulasProxFx} aulas para próxima faixa</p>
              ) : (
                <p className="text-xs text-[var(--gold)]">Faixa máxima</p>
              )}
            </div>
          ))}
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <h3 className="font-bold mb-3">📋 Próximas Graduações</h3>
          <p className="text-xs text-[var(--white-muted)]">Nenhum aluno próximo da graduação no momento.</p>
        </div>
      </div>
    </DashboardShell>
  )
}

"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { useSession } from "next-auth/react"

const feed = [
  { id: "1", user: "Lucas Costa", belt: "Roxa", degree: 1, action: "completou 150 aulas! 🎉", time: "2h atrás", avatar: "LC", type: "milestone" },
  { id: "2", user: "Maria Fernandes", belt: "Azul", degree: 1, action: "ganhou a medalha Dedicação 🔥", time: "5h atrás", avatar: "MF", type: "achievement" },
  { id: "3", user: "Thiago Pereira", belt: "Preta", degree: 1, action: "completou 10 dias de streak! 💪", time: "1d atrás", avatar: "TP", type: "streak" },
  { id: "4", user: "Pedro Santos", belt: "Branca", degree: 2, action: "subiu para 2º grau! ⬆️", time: "2d atrás", avatar: "PS", type: "promotion" },
  { id: "5", user: "Ana Beatriz", belt: "Branca", degree: 0, action: "fez o primeiro check-in! 🎯", time: "3d atrás", avatar: "AB", type: "first" },
  { id: "6", user: "Felipe Rocha", belt: "Marrom", degree: 2, action: "completou 200 aulas! 💯", time: "4d atrás", avatar: "FR", type: "milestone" },
]

export default function MuralPage() {
  const { data: session } = useSession()

  return (
    <DashboardShell role="aluno">
      <div className="animate-fade-in space-y-4">
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 text-center">
          <div className="text-3xl mb-2">📢</div>
          <h3 className="font-bold">Mural da Academia</h3>
          <p className="text-xs text-[var(--white-muted)]">Acompanhe as conquistas dos seus companheiros</p>
        </div>

        <div className="space-y-3">
          {feed.map((item) => (
            <div key={item.id} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-4 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center text-sm font-bold text-black flex-shrink-0">
                  {item.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{item.user}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--dark-border)] text-[var(--white-muted)]">
                      {item.belt} {item.degree + 1}º
                    </span>
                  </div>
                  <p className="text-sm text-[var(--white-muted)] mt-0.5">{item.action}</p>
                  <p className="text-[10px] text-[var(--gray)] mt-1">{item.time}</p>
                </div>
                <span className="text-lg">{item.type === "achievement" ? "🏅" : item.type === "streak" ? "🔥" : item.type === "promotion" ? "⬆️" : item.type === "first" ? "🎯" : "🎉"}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center py-4">
          <button className="px-5 py-2.5 rounded-lg font-semibold text-sm border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-all">
            🎉 Compartilhar minha conquista
          </button>
        </div>
      </div>
    </DashboardShell>
  )
}

"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"

const feed = [
  { id: "1", user: "Lucas Costa", belt: "Roxa", degree: 1, action: "completou 150 aulas! 🎉", time: "2h atrás", avatar: "LC", type: "milestone" },
  { id: "2", user: "Maria Fernandes", belt: "Azul", degree: 1, action: "ganhou a medalha Dedicação 🔥", time: "5h atrás", avatar: "MF", type: "achievement" },
  { id: "3", user: "Thiago Pereira", belt: "Preta", degree: 1, action: "completou 10 dias de streak! 💪", time: "1d atrás", avatar: "TP", type: "streak" },
  { id: "4", user: "Pedro Santos", belt: "Branca", degree: 2, action: "subiu para 2º grau! ⬆️", time: "2d atrás", avatar: "PS", type: "promotion" },
  { id: "5", user: "Ana Beatriz", belt: "Branca", degree: 0, action: "fez o primeiro check-in! 🎯", time: "3d atrás", avatar: "AB", type: "first" },
  { id: "6", user: "Felipe Rocha", belt: "Marrom", degree: 2, action: "completou 200 aulas! 💯", time: "4d atrás", avatar: "FR", type: "milestone" },
]

const beltColors: Record<string, string> = {
  Branca: "bg-gray-100 text-gray-900",
  Azul: "bg-blue-700 text-white",
  Roxa: "bg-purple-700 text-white",
  Marrom: "bg-amber-800 text-white",
  Preta: "bg-black text-yellow-400 border border-gray-600",
}

export default function MuralPage() {
  const { data: session } = useSession()

  return (
    <DashboardShell role="aluno">
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">📢</div>
          <h3 className="font-bold">Mural da Academia</h3>
          <p className="text-xs text-[var(--white-muted)]">Acompanhe as conquistas dos colegas</p>
        </div>

        <div className="space-y-3">
          {feed.map((item) => (
            <div key={item.id} className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-4 hover-card">
              <div className="flex items-start gap-3.5">
                <Avatar name={item.user} faixa={item.belt} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{item.user}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${beltColors[item.belt] || "bg-gray-100 text-gray-900"}`}>
                      {item.belt} · {item.degree + 1}º
                    </span>
                  </div>
                  <p className="text-sm text-[var(--white-muted)] mt-1">{item.action}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-[var(--gray)]">{item.time}</span>
                    <button className="text-[10px] text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors font-semibold">
                      🎉 Celebrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 text-center">
          <button className="btn-gold px-6 py-3 text-sm inline-flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Compartilhar minha conquista
          </button>
        </div>
      </div>
    </DashboardShell>
  )
}

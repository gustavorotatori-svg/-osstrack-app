"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"

type Presenca = {
  id: string
  aluno: { id: string; nome: string; faixa: string }
  data: string
  horario: string
  status: string
  turma: string
}

export function PresencasClient({ presencasHoje: initial }: { presencasHoje: Presenca[] }) {
  const [presencas, setPresencas] = useState(initial)
  const [filtro, setFiltro] = useState<"todas" | "pending" | "confirmed">("todas")

  async function confirmar(presencaId: string, status: string) {
    await fetch("/api/presenca/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presencaId, status }),
    })
    setPresencas((prev) => prev.map((p) => p.id === presencaId ? { ...p, status } : p))
  }

  const filtradas = filtro === "todas" ? presencas : presencas.filter((p) => p.status === filtro)

  return (
    <DashboardShell role="professor">
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5">
          <h2 className="font-bold text-lg mb-1">📋 Presenças</h2>
          <p className="text-xs text-[var(--white-muted)] mb-4">{presencas.length} registros hoje</p>

          <div className="flex gap-1 bg-[var(--dark-border)] rounded-lg p-1 mb-4">
            {(["todas", "pending", "confirmed"] as const).map((f) => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${filtro === f ? "bg-[var(--gold)] text-black" : "text-[var(--white-muted)] hover:text-white"}`}>
                {f === "todas" ? "Todas" : f === "pending" ? "⏳ Pendentes" : "✅ Confirmadas"}
              </button>
            ))}
          </div>

          {filtradas.length === 0 ? (
            <p className="text-sm text-[var(--white-muted)] text-center py-8">Nenhuma presença encontrada</p>
          ) : (
            <div className="space-y-1">
              {filtradas.map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[var(--dark-border)]/30 transition-all">
                  <Avatar name={p.aluno.nome} faixa={p.aluno.faixa} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{p.aluno.nome}</div>
                    <div className="text-[11px] text-[var(--white-muted)]">{p.aluno.faixa} · {p.turma} · {p.horario}</div>
                  </div>
                  {p.status === "confirmed" ? (
                    <span className="badge-emerald text-[10px] shrink-0">Presente</span>
                  ) : (
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => confirmar(p.id, "confirmed")} className="w-8 h-8 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</button>
                      <button onClick={() => confirmar(p.id, "rejected")} className="w-8 h-8 rounded-xl bg-red-700/80 hover:bg-red-700 text-white flex items-center justify-center text-xs font-bold">✗</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}

"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"

type Props = {
  academia: { nome: string; responsavel: string }
  stats: { totalAlunos: number; totalProfessores: number; totalPresencas: number }
  alunos: { id: string; nome: string; faixa: string; grau: number }[]
  presencas: { id: string; aluno: string; data: string; horario: string; status: string }[]
  graduacoes: { faixa: string; graus: number; aulasPorGrau: number; aulasProxFx: number | null }[]
}

export function OwnerDashboardClient({ academia, stats, alunos, presencas, graduacoes }: Props) {
  return (
    <DashboardShell role="dono">
      <div className="animate-fade-in space-y-4">
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 text-center">
          <div className="text-3xl mb-2">🥋</div>
          <h2 className="text-xl font-extrabold">{academia.nome}</h2>
          <p className="text-xs text-[var(--white-muted)]">👑 {academia.responsavel} · Dono</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { value: stats.totalAlunos, label: "Alunos Ativos", color: "text-[var(--gold)]" },
            { value: stats.totalProfessores, label: "Professores", color: "text-emerald-500" },
            { value: stats.totalPresencas, label: "Total Presenças", color: "text-[var(--gold)]" },
            { value: `${Math.round((stats.totalAlunos > 0 ? 1 : 0) * 100)}%`, label: "Engajamento", color: "text-blue-500" },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-4 text-center">
              <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-[var(--white-muted)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <h3 className="font-bold mb-3">👥 Alunos</h3>
          <div className="space-y-0">
            {alunos.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-[var(--dark-border)] last:border-0">
                <div className="w-9 h-9 rounded-full bg-[var(--dark-border)] flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {a.nome.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{a.nome}</div>
                  <div className="text-[11px] text-[var(--white-muted)]">{a.faixa} {'★'.repeat(a.grau + 1)}</div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getBeltColor(a.faixa)}`}>
                  {a.faixa}
                </span>
              </div>
            ))}
            {alunos.length === 0 && <p className="text-sm text-[var(--white-muted)] text-center py-4">Nenhum aluno ainda</p>}
          </div>
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">🥋 Regras de Graduação</h3>
          </div>
          {graduacoes.map((g) => (
            <div key={g.faixa} className="bg-black border border-[var(--dark-border)] rounded-xl p-4 mb-2 last:mb-0">
              <div className="font-bold text-sm">{getBeltEmoji(g.faixa)} {g.faixa}</div>
              <p className="text-xs text-[var(--white-muted)]">{g.graus} graus · {g.aulasPorGrau} aulas/grau</p>
              {g.aulasProxFx && <p className="text-xs text-[var(--white-muted)]">{g.aulasProxFx} aulas para próxima faixa</p>}
            </div>
          ))}
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <h3 className="font-bold mb-3">📊 Últimas Presenças</h3>
          {presencas.slice(0, 8).map((p) => (
            <div key={p.id} className="flex items-center gap-3 py-2 border-b border-[var(--dark-border)] last:border-0">
              <div className="flex-1">
                <div className="text-sm font-semibold">{p.aluno}</div>
                <div className="text-[11px] text-[var(--white-muted)]">{new Date(p.data).toLocaleDateString("pt-BR")} às {p.horario}</div>
              </div>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                p.status === "confirmed" ? "bg-emerald-500/15 text-emerald-500" : "bg-yellow-500/15 text-yellow-500"
              }`}>
                {p.status === "confirmed" ? "✓" : "⏳"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}

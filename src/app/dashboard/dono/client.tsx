"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
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
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">🥋</div>
          <h2 className="text-xl font-extrabold tracking-tight">{academia.nome}</h2>
          <p className="text-xs text-[var(--white-muted)] mt-1.5">👑 {academia.responsavel} · Dono</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { value: stats.totalAlunos, label: "Alunos Ativos", icon: "👥", color: "text-[var(--gold)]" },
            { value: stats.totalProfessores, label: "Professores", icon: "👨‍🏫", color: "text-emerald-500" },
            { value: stats.totalPresencas, label: "Total Presenças", icon: "✅", color: "text-[var(--gold)]" },
            { value: `${Math.round((stats.totalAlunos > 0 ? 1 : 0) * 100)}%`, label: "Engajamento", icon: "📊", color: "text-blue-500" },
          ].map((s, i) => (
            <div key={s.label} className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-4 text-center hover-card animate-scale-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="text-lg mb-1">{s.icon}</div>
              <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-bold text-sm tracking-tight">👥 Alunos</h3>
            <span className="badge-gold text-[10px]">{alunos.length} total</span>
          </div>
          <div className="space-y-1">
            {alunos.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center gap-3.5 py-2.5 px-3 rounded-xl border border-transparent hover:bg-[var(--dark-border)]/30 transition-all">
                <Avatar name={a.nome} faixa={a.faixa} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{a.nome}</div>
                  <div className="text-[11px] text-[var(--white-muted)]">{a.faixa} {'★'.repeat(a.grau + 1)}</div>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${getBeltColor(a.faixa)}`}>
                  {getBeltEmoji(a.faixa)} {a.faixa}
                </span>
              </div>
            ))}
            {alunos.length === 0 && <p className="text-sm text-[var(--white-muted)] text-center py-6">Nenhum aluno ainda</p>}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-bold text-sm tracking-tight">🥋 Regras de Graduação</h3>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {graduacoes.map((g) => (
              <div key={g.faixa} className="bg-black/40 border border-[var(--dark-border)] rounded-2xl p-4 transition-all hover:border-[rgba(201,168,76,0.15)]">
                <div className="font-bold text-sm">{getBeltEmoji(g.faixa)} {g.faixa}</div>
                <div className="flex gap-4 mt-1.5">
                  <div className="text-xs text-[var(--white-muted)]">{g.graus} graus</div>
                  <div className="text-xs text-[var(--white-muted)]">{g.aulasPorGrau} aulas/grau</div>
                  {g.aulasProxFx && <div className="text-xs text-[var(--gold)]">{g.aulasProxFx} aulas para prox. faixa</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card">
          <h3 className="font-bold text-sm tracking-tight mb-3.5">📊 Últimas Presenças</h3>
          <div className="space-y-1">
            {presencas.slice(0, 8).map((p) => (
              <div key={p.id} className="flex items-center gap-3.5 py-2.5 px-3 rounded-xl border border-transparent hover:bg-[var(--dark-border)]/30 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{p.aluno}</div>
                  <div className="text-[11px] text-[var(--white-muted)]">{new Date(p.data).toLocaleDateString("pt-BR")} às {p.horario}</div>
                </div>
                <span className={`badge text-[10px] shrink-0 ${
                  p.status === "confirmed" ? "badge-emerald" : "bg-yellow-500/15 text-yellow-500"
                }`}>
                  {p.status === "confirmed" ? "Presente" : "Pendente"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

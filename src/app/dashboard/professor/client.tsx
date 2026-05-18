"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"

type Props = {
  professor: { nome: string; faixa: string; grau: number }
  alunos: { id: string; nome: string; faixa: string; grau: number }[]
  turmas: { id: string; nome: string; horario: string; dias: string; maxAlunos: number; totalAlunos: number }[]
  presencasHoje: { id: string; aluno: { id: string; nome: string; faixa: string }; data: string; horario: string; status: string; turma: string }[]
}

export function ProfessorDashboardClient({ professor, alunos, turmas, presencasHoje }: Props) {
  return (
    <DashboardShell role="professor">
      <div className="animate-fade-in space-y-4">
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 text-center">
          <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center text-2xl font-extrabold text-black mx-auto mb-3">
            {professor.nome.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-extrabold">Prof. {professor.nome}</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-2 belt-black">
            ⬛ {professor.faixa} · {professor.grau}º Grau
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: alunos.length, label: "Alunos" },
            { value: presencasHoje.filter(p => p.status === "confirmed").length, label: "Presentes Hoje" },
            { value: presencasHoje.filter(p => p.status === "pending").length, label: "Pendentes" },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-4 text-center">
              <div className={`text-2xl font-extrabold ${
                s.label === "Presentes Hoje" ? "text-emerald-500" : s.label === "Pendentes" ? "text-yellow-500" : "text-[var(--gold)]"
              }`}>
                {s.value}
              </div>
              <div className="text-[11px] text-[var(--white-muted)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">📋 Presenças de Hoje</h3>
            <span className="text-xs text-[var(--white-muted)]">{presencasHoje.length} registros</span>
          </div>
          {presencasHoje.length === 0 ? (
            <p className="text-sm text-[var(--white-muted)] text-center py-4">Nenhum check-in hoje</p>
          ) : (
            presencasHoje.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-[var(--dark-border)] last:border-0">
                <div className="w-9 h-9 rounded-full bg-[var(--dark-border)] flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {p.aluno.nome.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{p.aluno.nome}</div>
                  <div className="text-[11px] text-[var(--white-muted)]">{p.aluno.faixa} · {p.turma} · {p.horario}</div>
                </div>
                {p.status === "confirmed" ? (
                  <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/15 px-2.5 py-1 rounded-full">✓ Presente</span>
                ) : (
                  <div className="flex gap-1">
                    <button className="btn btn-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-2.5 py-1 text-xs font-bold transition-colors">✓</button>
                    <button className="btn btn-sm bg-red-700 hover:bg-red-600 text-white rounded-lg px-2.5 py-1 text-xs font-bold transition-colors">✗</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <h3 className="font-bold mb-3">📅 Minhas Turmas</h3>
          {turmas.map((t) => (
            <div key={t.id} className="bg-black border border-[var(--dark-border)] rounded-xl p-4 mb-3 last:mb-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm">{t.nome}</h4>
                <span className="text-xs text-[var(--white-muted)]">{t.totalAlunos}/{t.maxAlunos}</span>
              </div>
              <p className="text-xs text-[var(--white-muted)]">🕐 {t.horario} · {t.dias}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}

"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"

type Props = {
  aluno: {
    id: string; nome: string; faixa: string; grau: number
    totalAulas: number; dataInicio: string; academia: string
  }
  graduacao: { aulasPorGrau: number; aulasProxFx: number | null; graus: number } | null
  ultimasPresencas: { id: string; data: string; horario: string; status: string; turma: string }[]
  conquistas: { id: string; nome: string; icone: string; descricao: string; desbloqueada: boolean }[]
}

export function StudentDashboardClient({ aluno, graduacao, ultimasPresencas, conquistas }: Props) {
  const classesProxGrau = graduacao ? (aluno.grau + 1) * graduacao.aulasPorGrau : 0
  const progressoGrau = graduacao ? Math.min(100, (aluno.totalAulas / classesProxGrau) * 100) : 0
  const restamGrau = Math.max(0, classesProxGrau - aluno.totalAulas)

  const progressoFaixa = graduacao?.aulasProxFx ? Math.min(100, (aluno.totalAulas / graduacao.aulasProxFx) * 100) : null
  const restamFaixa = graduacao?.aulasProxFx ? Math.max(0, graduacao.aulasProxFx - aluno.totalAulas) : null

  const hoje = new Date()
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1).getDay()
  const diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate()

  return (
    <DashboardShell role="aluno">
      <div className="animate-fade-in space-y-4">
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 text-center">
          <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center text-2xl font-extrabold text-black mx-auto mb-3">
            {aluno.nome.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-extrabold">{aluno.nome}</h2>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getBeltColor(aluno.faixa)}`}>
            {getBeltEmoji(aluno.faixa)} {aluno.faixa} · {aluno.grau + 1}º Grau
          </span>
          <p className="text-xs text-[var(--white-muted)] mt-2">{aluno.academia}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: aluno.totalAulas, label: "Total de Aulas" },
            { value: ultimasPresencas.filter(p => p.status === "confirmed").length, label: "Presenças" },
            { value: "🔥 5", label: "Sequência" },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold text-[var(--gold)]">{s.value}</div>
              <div className="text-[11px] text-[var(--white-muted)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Próximo Grau</h3>
            <span className="text-xs text-[var(--gold)] font-semibold">{restamGrau} aulas restam</span>
          </div>
          <div className="h-2 bg-[var(--dark-border)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[var(--gold)] to-yellow-300 rounded-full transition-all duration-1000" style={{ width: `${progressoGrau}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-[var(--white-muted)] mt-1.5">
            <span>{aluno.totalAulas} de {classesProxGrau} aulas</span>
            <span>{Math.round(progressoGrau)}%</span>
          </div>
        </div>

        {progressoFaixa !== null && (
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Próxima Faixa</h3>
              <span className="text-xs text-[var(--white-muted)]">{restamFaixa} aulas</span>
            </div>
            <div className="h-2 bg-[var(--dark-border)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full transition-all duration-1000" style={{ width: `${progressoFaixa}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-[var(--white-muted)] mt-1.5">
              <span>{aluno.totalAulas} de {graduacao?.aulasProxFx} aulas</span>
              <span>{Math.round(progressoFaixa)}%</span>
            </div>
          </div>
        )}

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">📅 Maio 2026</h3>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {diasSemana.map((d) => (
              <div key={d} className="text-[10px] text-[var(--gray)] font-semibold py-1">{d}</div>
            ))}
            {Array.from({ length: primeiroDia }, (_, i) => (
              <div key={`e-${i}`} />
            ))}
            {Array.from({ length: diasNoMes }, (_, i) => {
              const dia = i + 1
              const isToday = dia === hoje.getDate()
              const temPresenca = ultimasPresencas.some((p) => new Date(p.data).getDate() === dia)
              return (
                <div
                  key={dia}
                  className={`aspect-square flex items-center justify-center text-xs rounded-full ${
                    isToday ? "bg-[var(--gold)] text-black font-bold" : temPresenca ? "bg-[rgba(201,168,76,0.15)] text-[var(--gold)]" : "text-[var(--white-muted)]"
                  }`}
                >
                  {dia}
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">🏆 Conquistas</h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {conquistas.slice(0, 4).map((c) => (
              <div key={c.id} className={`text-center ${c.desbloqueada ? "" : "opacity-40 grayscale"}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto mb-1 ${
                  c.desbloqueada ? "bg-gradient-to-br from-[rgba(201,168,76,0.2)] to-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)]" : "bg-[var(--dark-border)]"
                }`}>
                  {c.icone}
                </div>
                <div className="text-[9px] text-[var(--white-muted)]">{c.nome}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <h3 className="font-bold mb-3">📋 Últimos Check-ins</h3>
          {ultimasPresencas.length === 0 ? (
            <p className="text-sm text-[var(--white-muted)] text-center py-4">Nenhum check-in ainda</p>
          ) : (
            ultimasPresencas.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-[var(--dark-border)] last:border-0">
                <div className="flex-1">
                  <div className="text-sm font-semibold">{p.turma || "Treino"}</div>
                  <div className="text-[11px] text-[var(--white-muted)]">
                    {new Date(p.data).toLocaleDateString("pt-BR")} às {p.horario}
                  </div>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  p.status === "confirmed" ? "bg-emerald-500/15 text-emerald-500" : "bg-yellow-500/15 text-yellow-500"
                }`}>
                  {p.status === "confirmed" ? "✓ Presente" : "⏳ Pendente"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  )
}

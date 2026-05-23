"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { EmptyState } from "@/components/ui/empty-state"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"
import { DailyMissions } from "@/components/gamification/daily-missions"

type Props = {
  aluno: { id: string; nome: string; faixa: string; grau: number; totalAulas: number; dataInicio: string; academia: string }
  graduacao: { aulasPorGrau: number; aulasProxFx: number | null; graus: number } | null
  ultimasPresencas: { id: string; data: string; horario: string; status: string; turma: string }[]
  conquistas: { id: string; nome: string; icone: string; descricao: string; desbloqueada: boolean }[]
  streak: number
}

export function StudentDashboardClient({ aluno, graduacao, ultimasPresencas, conquistas, streak: streakInicial }: Props) {
  const beltMap: Record<string, string> = { Branca: "white", Azul: "blue", Roxa: "purple", Marrom: "brown", Preta: "black" }
  const beltKey = beltMap[aluno.faixa] || "white"
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
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/60 border border-[var(--dark-border)] rounded-2xl p-6 text-center relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-[var(--gold)]/5 rounded-full blur-2xl" />
          <div className="mx-auto mb-3.5">{<Avatar name={aluno.nome} faixa={aluno.faixa} size={64} />}</div>
          <h2 className="text-xl font-extrabold tracking-tight">{aluno.nome}</h2>
          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold mt-2.5 ${getBeltColor(aluno.faixa)}`}>
            {getBeltEmoji(aluno.faixa)} {aluno.faixa} · {aluno.grau + 1}º Grau
          </span>
          <p className="text-xs text-[var(--white-muted)] mt-3">{aluno.academia}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { value: aluno.totalAulas, label: "Total de Aulas", icon: "🥋" },
            { value: ultimasPresencas.filter(p => p.status === "confirmed").length, label: "Presenças", icon: "✅" },
            { value: `🔥 ${streakInicial}`, label: "Sequência", icon: "🔥" },
          ].map((s, i) => (
            <div
              key={s.label}
              className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-4 text-center hover-card animate-scale-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="text-lg mb-1.5">{s.icon}</div>
              <div className="text-2xl font-extrabold text-[var(--gold)]">{s.value}</div>
              <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        <div className={`bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card relative overflow-hidden`}>
          <div className={`absolute inset-0 opacity-[0.04] belt-texture-${beltKey}`} />
          <div className="flex items-center justify-between mb-3.5 relative">
            <h3 className="font-bold text-sm tracking-tight">Próximo Grau</h3>
            <span className="badge-gold text-[10px]">{restamGrau} aulas restam</span>
          </div>
          <div className="h-2.5 bg-[var(--dark-border)] rounded-full overflow-hidden p-[1px]">
            <div className="h-full bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-yellow-300 rounded-full transition-all duration-1000" style={{ width: `${progressoGrau}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-[var(--white-muted)] mt-2">
            <span>{aluno.totalAulas} de {classesProxGrau} aulas</span>
            <span className="text-[var(--gold)] font-semibold">{Math.round(progressoGrau)}%</span>
          </div>
        </div>

        {progressoFaixa !== null && (
          <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card relative overflow-hidden">
            <div className={`absolute inset-0 opacity-[0.04] belt-texture-${beltKey}`} />
            <div className="flex items-center justify-between mb-3.5 relative">
              <h3 className="font-bold text-sm tracking-tight">Próxima Faixa</h3>
              <span className="badge text-[10px] bg-[rgba(139,26,26,0.15)] text-[var(--red)]">{restamFaixa} aulas</span>
            </div>
            <div className="h-2.5 bg-[var(--dark-border)] rounded-full overflow-hidden p-[1px]">
              <div className="h-full bg-gradient-to-r from-[var(--red-dark)] via-[var(--red)] to-red-500 rounded-full transition-all duration-1000" style={{ width: `${progressoFaixa}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-[var(--white-muted)] mt-2">
              <span>{aluno.totalAulas} de {graduacao?.aulasProxFx} aulas</span>
              <span className="text-[var(--red)] font-semibold">{Math.round(progressoFaixa)}%</span>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-bold text-sm tracking-tight">📅 {hoje.toLocaleString("pt-BR", { month: "long", year: "numeric" })}</h3>
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {diasSemana.map((d) => (
              <div key={d} className="text-[9px] text-[var(--gray)] font-semibold py-1 uppercase tracking-wider">{d}</div>
            ))}
            {Array.from({ length: primeiroDia }, (_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: diasNoMes }, (_, i) => {
              const dia = i + 1
              const isToday = dia === hoje.getDate()
              const temPresenca = ultimasPresencas.some((p) => new Date(p.data).getDate() === dia)
              return (
                <div
                  key={dia}
                  className={`aspect-square flex items-center justify-center text-xs rounded-xl transition-all ${
                    isToday
                      ? "gradient-gold text-black font-bold shadow-lg scale-105"
                      : temPresenca
                      ? "bg-[rgba(201,168,76,0.12)] text-[var(--gold)] border border-[rgba(201,168,76,0.15)]"
                      : "text-[var(--white-muted)] hover:bg-[var(--dark-border)]"
                  }`}
                >
                  {dia}
                </div>
              )
            })}
          </div>
        </div>

        <DailyMissions />

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-bold text-sm tracking-tight">🏆 Conquistas</h3>
            <span className="badge-gold text-[10px]">{conquistas.filter(c => c.desbloqueada).length}/{conquistas.length}</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {conquistas.slice(0, 4).map((c) => (
              <div key={c.id} className={`text-center transition-all ${c.desbloqueada ? "" : "opacity-30 grayscale"}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mx-auto mb-1.5 transition-all ${
                  c.desbloqueada
                    ? "bg-gradient-to-br from-[rgba(201,168,76,0.2)] to-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.25)] shadow-sm"
                    : "bg-[var(--dark-border)]"
                }`}>
                  {c.icone}
                </div>
                <div className="text-[9px] text-[var(--white-muted)] leading-tight">{c.nome}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card">
          <h3 className="font-bold text-sm tracking-tight mb-3.5">📋 Últimos Check-ins</h3>
          {ultimasPresencas.length === 0 ? (
            <EmptyState icon="checkin" title="Nenhum check-in ainda" description="Seu histórico de presenças vai aparecer aqui depois do primeiro check-in." />
          ) : (
            <div className="space-y-1">
              {ultimasPresencas.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center gap-3.5 py-2.5 px-3 rounded-xl border border-transparent hover:bg-[var(--dark-border)]/30 transition-all">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                    p.status === "confirmed" ? "bg-emerald-500/10" : "bg-yellow-500/10"
                  }`}>
                    {p.status === "confirmed" ? "✅" : "⏳"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{p.turma || "Treino"}</div>
                    <div className="text-[11px] text-[var(--white-muted)]">
                      {new Date(p.data).toLocaleDateString("pt-BR")} às {p.horario}
                    </div>
                  </div>
                  <span className={`badge text-[10px] shrink-0 ${
                    p.status === "confirmed" ? "badge-emerald" : "bg-yellow-500/15 text-yellow-500"
                  }`}>
                    {p.status === "confirmed" ? "Presente" : "Pendente"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}

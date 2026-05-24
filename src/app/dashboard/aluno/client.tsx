"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { EmptyState } from "@/components/ui/empty-state"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"
import { DailyMissions } from "@/components/gamification/daily-missions"
import { PremiumBanner } from "@/components/ui/premium-lock"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

const quotes = [
  "\"Toda faixa preta foi uma faixa branca que nunca desistiu.\"",
  "\"O tapete não mente. Ele devolve exatamente o que você dá a ele.\"",
  "\"A evolução não é sobre ser melhor que os outros. É sobre ser melhor que você ontem.\"",
  "\"Um round de cada vez. Uma aula de cada vez. Uma faixa de cada vez.\"",
  "\"Disciplina é fazer o que precisa ser feito, mesmo quando ninguém está olhando.\"",
  "\"O Jiu-Jitsu não te transforma em um lutador. Ele te transforma em quem você deveria ser.\"",
  "\"Oss não é só uma palavra. É um compromisso de continuar.\"",
  "\"Não é sobre quantas vezes você cai. É sobre quantas vezes você levanta e volta pro tatame.\"",
  "\"Seu maior oponente não está do outro lado do tatame. Está na sua cabeça dizendo 'amanhã eu vou'.\"",
  "\"A faixa preta não é um destino. É um jeito de viver.\"",
]

type Props = {
  aluno: { id: string; nome: string; faixa: string; grau: number; totalAulas: number; dataInicio: string; academia: string }
  graduacao: { aulasPorGrau: number; aulasProxFx: number | null; graus: number } | null
  ultimasPresencas: { id: string; data: string; horario: string; status: string; turma: string }[]
  conquistas: { id: string; nome: string; icone: string; descricao: string; desbloqueada: boolean }[]
  streak: number
}

export function StudentDashboardClient({ aluno, graduacao, ultimasPresencas, conquistas, streak: streakInicial }: Props) {
  const router = useRouter()
  const [treinandoAgora, setTreinandoAgora] = useState<{ nome: string; faixa: string }[]>([])

  useEffect(() => {
    fetch("/api/treino")
      .then((r) => r.json())
      .then((data) => setTreinandoAgora(data.treinando || []))
      .catch(() => {})
    const id = setInterval(() => {
      fetch("/api/treino")
        .then((r) => r.json())
        .then((data) => setTreinandoAgora(data.treinando || []))
        .catch(() => {})
    }, 30000)
    return () => clearInterval(id)
  }, [])
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

  const quoteIndex = new Date().getDate() % quotes.length

  return (
    <DashboardShell role="aluno">
      <div className="space-y-4">
        {/* Quote do Dia */}
        <div className="bg-gradient-to-br from-[rgba(139,26,26,0.06)] to-[rgba(201,168,76,0.03)] border border-[rgba(139,26,26,0.12)] rounded-2xl p-4 text-center relative overflow-hidden">
          <div className="absolute top-[-10px] right-[-10px] text-6xl opacity-[0.04] select-none">🥋</div>
          <p className="text-xs text-[var(--white-muted)] italic leading-relaxed relative">
            {quotes[quoteIndex]}
          </p>
          <div className="text-[9px] text-[var(--gray)] mt-2 uppercase tracking-widest">Quote do Dia</div>
        </div>

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
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-4 text-center hover-card animate-scale-in">
            <div className="text-lg mb-1.5">🥋</div>
            <div className="text-2xl font-extrabold text-[var(--gold)]">{aluno.totalAulas}</div>
            <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">Total de Aulas</div>
          </div>
          <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-4 text-center hover-card animate-scale-in" style={{ animationDelay: "0.08s" }}>
            <div className="text-lg mb-1.5">✅</div>
            <div className="text-2xl font-extrabold text-[var(--gold)]">{ultimasPresencas.filter(p => p.status === "confirmed").length}</div>
            <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">Presenças</div>
          </div>
          <div className={`bg-[var(--dark-card)] border rounded-2xl p-4 text-center hover-card animate-scale-in ${streakInicial > 0 ? "border-[rgba(255,140,0,0.2)] animate-fire-glow" : "border-[var(--dark-border)]"}`} style={{ animationDelay: "0.16s" }}>
            <div className={`text-lg mb-1.5 ${streakInicial > 0 ? "animate-fire" : ""}`}>🔥</div>
            <div className="text-2xl font-extrabold text-[var(--gold)]">{streakInicial}</div>
            <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">Sequência</div>
          </div>
        </div>

        {treinandoAgora.length > 0 && (
          <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card">
            <h3 className="font-bold text-sm tracking-tight mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Treinando agora
            </h3>
            <div className="flex flex-wrap gap-2">
              {treinandoAgora.map((p, i) => (
                <div key={i} className="flex items-center gap-2 bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.12)] rounded-xl px-3 py-1.5 text-xs">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="font-semibold">{p.nome}</span>
                  <span className="text-[var(--white-muted)]">· {p.faixa}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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

        <PremiumBanner onClick={() => router.push("/dashboard/aluno/premium")} />
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
            <EmptyState icon="checkin" title="Toda jornada começa com um primeiro passo" description="Faça seu primeiro check-in e comece a escrever sua história no tatame. Cada presença conta." />
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

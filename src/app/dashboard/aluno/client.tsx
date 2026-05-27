"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { EmptyState } from "@/components/ui/empty-state"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { PageTransition } from "@/components/ui/page-transition"
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

const belts = [
  { name: "Branca", color: "bg-white", text: "text-black", emoji: "⬜" },
  { name: "Azul", color: "bg-blue-600", text: "text-white", emoji: "🟦" },
  { name: "Roxa", color: "bg-purple-600", text: "text-white", emoji: "🟣" },
  { name: "Marrom", color: "bg-amber-800", text: "text-white", emoji: "🟤" },
  { name: "Preta", color: "bg-gray-900", text: "text-[var(--gold)]", emoji: "⬛" },
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
  const [tab, setTab] = useState<"progresso" | "presencas" | "conquistas">("progresso")

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
  const quoteIndex = hoje.getDate() % quotes.length

  const currentBeltIdx = belts.findIndex(b => b.name === aluno.faixa)

  return (
    <DashboardShell role="aluno">
      <PageTransition>
        <div className="space-y-5">
          {/* Quote */}
          <div className="glass-card-gold p-4 text-center relative overflow-hidden">
            <div className="absolute top-[-8px] right-[-8px] text-6xl opacity-[0.03] select-none">🥋</div>
            <p className="text-xs text-[var(--white-muted)] italic leading-relaxed relative">{quotes[quoteIndex]}</p>
          </div>

          {/* Hero */}
          <div className="glass-card p-6 text-center relative overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-28 h-28 bg-[var(--gold)]/5 rounded-full blur-3xl" />
            <div className="mx-auto mb-3 relative">
              <Avatar name={aluno.nome} faixa={aluno.faixa} size={72} />
              {treinandoAgora.length > 0 && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[var(--black-soft)] animate-pulse" />
              )}
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">{aluno.nome}</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1.5 px-4 py-1 round-full text-xs font-semibold ${getBeltColor(aluno.faixa)}`}>
                {getBeltEmoji(aluno.faixa)} {aluno.faixa} · {aluno.grau + 1}º Grau
              </span>
            </div>
            <p className="text-xs text-[var(--white-muted)] mt-2">{aluno.academia}</p>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-3 gap-3 enter-stagger">
            <div className="stat-card">
              <div className="text-lg mb-1">🥋</div>
              <div className="text-2xl font-extrabold text-[var(--gold)]"><AnimatedCounter value={aluno.totalAulas} /></div>
              <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">Aulas</div>
            </div>
            <div className="stat-card">
              <div className="text-lg mb-1">✅</div>
              <div className="text-2xl font-extrabold text-emerald-500"><AnimatedCounter value={ultimasPresencas.filter(p => p.status === "confirmed").length} /></div>
              <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">Presenças</div>
            </div>
            <div className={`stat-card ${streakInicial > 0 ? "border-[rgba(255,140,0,0.2)]" : ""}`}>
              <div className={`text-lg mb-1 ${streakInicial > 0 ? "animate-fire" : ""}`}>🔥</div>
              <div className="text-2xl font-extrabold text-[var(--gold)]"><AnimatedCounter value={streakInicial} /></div>
              <div className="text-[10px] text-[var(--white-muted)] mt-1 uppercase tracking-wide">Sequência</div>
            </div>
          </div>

          {/* Treinando agora */}
          {treinandoAgora.length > 0 && (
            <div className="glass-card-gold p-4 flex items-center gap-3">
              <span className="glow-dot green" />
              <div>
                <div className="text-xs font-semibold text-emerald-400">Treinando agora</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {treinandoAgora.map((p, i) => (
                    <span key={i} className="text-xs text-[var(--white-muted)]">
                      {p.nome} <span className="opacity-60">· {p.faixa}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="tab-bar">
            <button className={`tab-btn ${tab === "progresso" ? "active" : ""}`} onClick={() => setTab("progresso")}>
              📊 Progresso
            </button>
            <button className={`tab-btn ${tab === "presencas" ? "active" : ""}`} onClick={() => setTab("presencas")}>
              📅 Presenças
            </button>
            <button className={`tab-btn ${tab === "conquistas" ? "active" : ""}`} onClick={() => setTab("conquistas")}>
              🏆 Conquistas
            </button>
          </div>

          {/* Tab: Progresso */}
          {tab === "progresso" && (
            <div className="space-y-4">
              {/* Belt journey */}
              <div className="glass-card p-5">
                <h3 className="font-bold text-sm tracking-tight mb-4">Jornada das Faixas</h3>
                <div className="flex items-center">
                  {belts.map((belt, idx) => {
                    const isCurrent = idx === currentBeltIdx
                    const isCompleted = idx < currentBeltIdx
                    return (
                      <div key={belt.name} className={`belt-step ${isCurrent ? "current" : ""} ${isCompleted ? "completed" : ""}`}>
                        <div className={`belt-step-dot ${belt.color} ${belt.text}`}>
                          {isCompleted ? "✓" : idx + 1}
                        </div>
                        <span className={`text-[9px] font-semibold ${isCurrent ? "text-[var(--gold)]" : "text-[var(--gray)]"}`}>
                          {belt.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Próximo Grau */}
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm tracking-tight">Próximo Grau</h3>
                  <span className="tag-premium">{restamGrau} aulas restam</span>
                </div>
                <div className="progress-gold">
                  <div className="progress-gold-fill" style={{ width: `${progressoGrau}%` }} />
                </div>
                <div className="flex justify-between text-xs text-[var(--white-muted)] mt-2">
                  <span>{aluno.totalAulas} de {classesProxGrau} aulas</span>
                  <span className="text-[var(--gold)] font-bold">{Math.round(progressoGrau)}%</span>
                </div>
              </div>

              {/* Próxima Faixa */}
              {progressoFaixa !== null && (
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm tracking-tight">Próxima Faixa</h3>
                    <span className="tag-premium">{restamFaixa} aulas</span>
                  </div>
                  <div className="progress-gold">
                    <div className="progress-gold-fill" style={{ width: `${progressoFaixa}%`, background: 'linear-gradient(90deg, var(--red-dark), var(--red), #ef4444)' }} />
                  </div>
                  <div className="flex justify-between text-xs text-[var(--white-muted)] mt-2">
                    <span>{aluno.totalAulas} de {graduacao?.aulasProxFx} aulas</span>
                    <span className="text-[var(--red)] font-bold">{Math.round(progressoFaixa)}%</span>
                  </div>
                </div>
              )}

              <PremiumBanner onClick={() => router.push("/dashboard/aluno/premium")} />
              <DailyMissions />
            </div>
          )}

          {/* Tab: Presenças */}
          {tab === "presencas" && (
            <div className="space-y-4">
              {/* Calendar */}
              <div className="glass-card p-5">
                <h3 className="font-bold text-sm tracking-tight mb-4">{hoje.toLocaleString("pt-BR", { month: "long", year: "numeric" })}</h3>
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
                      <div key={dia}
                        className={`aspect-square flex items-center justify-center text-xs rounded-xl transition-all ${
                          isToday
                            ? "gradient-gold text-black font-bold shadow-lg scale-105"
                            : temPresenca
                            ? "bg-[rgba(201,168,76,0.12)] text-[var(--gold)] border border-[rgba(201,168,76,0.15)]"
                            : "text-[var(--white-muted)] hover:bg-[var(--dark-border)]"
                        }`}>
                        {dia}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recent check-ins */}
              <div className="glass-card p-5">
                <h3 className="font-bold text-sm tracking-tight mb-4">Últimos Check-ins</h3>
                {ultimasPresencas.length === 0 ? (
                  <div className="empty-premium">
                    <div className="empty-premium-icon">🥋</div>
                    <div className="empty-premium-title">Toda jornada começa com um primeiro passo</div>
                    <div className="empty-premium-desc">Faça seu primeiro check-in e comece a escrever sua história no tatame.</div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {ultimasPresencas.slice(0, 6).map((p) => (
                      <div key={p.id} className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-[var(--dark-border)]/30 transition-all">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${p.status === "confirmed" ? "bg-emerald-500/10" : "bg-yellow-500/10"}`}>
                          {p.status === "confirmed" ? "✅" : "⏳"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{p.turma || "Treino"}</div>
                          <div className="text-xs text-[var(--white-muted)]">
                            {new Date(p.data).toLocaleDateString("pt-BR")} às {p.horario}
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          p.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        }`}>
                          {p.status === "confirmed" ? "Presente" : "Pendente"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Conquistas */}
          {tab === "conquistas" && (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm tracking-tight">🏆 Conquistas</h3>
                <span className="tag-premium">{conquistas.filter(c => c.desbloqueada).length}/{conquistas.length}</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {conquistas.map((c) => (
                  <div key={c.id} className={`text-center transition-all ${c.desbloqueada ? "" : "opacity-30 grayscale"}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-1.5 transition-all ${
                      c.desbloqueada
                        ? "bg-gradient-to-br from-[rgba(201,168,76,0.2)] to-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.25)] shadow-sm"
                        : "bg-[var(--dark-border)]"
                    }`}>
                      {c.icone}
                    </div>
                    <div className="text-[9px] text-[var(--white-muted)] leading-tight font-medium">{c.nome}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

"use client"

import { useState } from "react"
import { Crown, Users, CheckCircle, XCircle, Calendar, Settings, FileText, ClipboardList, ArrowUpRight, BarChart3, GraduationCap } from "lucide-react"
import { DashboardShell } from "@/components/dashboard/shell"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { PageTransition } from "@/components/ui/page-transition"
import { useT } from "@/lib/use-t"
import { useRouter } from "next/navigation"

type Aluno = { id: string; nome: string; faixa: string; grau?: number }
type Turma = { id: string; nome: string; horario: string; dias: string; maxAlunos: number; totalAlunos: number }
type PresencaHoje = { id: string; aluno: Aluno; data: string; horario: string; status: string; turma: string }

export function ProfessorDashboardClient({
  professor,
  alunos,
  turmas,
  presencasHoje,
}: {
  professor: { nome: string; faixa: string; grau: number; academiaId: string | null }
  alunos: Aluno[]
  turmas: Turma[]
  presencasHoje: PresencaHoje[]
}) {
  const t = useT("professor.dashboard")
  const router = useRouter()
  const [tab, setTab] = useState<"geral" | "presencas">("geral")

  const confirmar = async (id: string) => {
    try {
      const res = await fetch("/api/presencas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "confirmed" }),
      })
      if (!res.ok) throw new Error()
      window.location.reload()
    } catch {}
  }

  const stats = {
    totalAlunos: alunos.length,
    presencasHoje: presencasHoje.filter(p => p.status === "confirmed").length,
    presencasPendentes: presencasHoje.filter(p => p.status === "pending").length,
  }

  const atendimento = presencasHoje.length > 0
    ? Math.round((presencasHoje.filter(p => p.status === "confirmed").length / presencasHoje.length) * 100)
    : 0

  const quickActions = [
    { label: "Turmas", icon: Calendar, href: "/dashboard/professor/turmas", color: "from-blue-600/20 to-blue-600/5", border: "border-blue-500/20" },
    { label: "Alunos", icon: Users, href: "/dashboard/professor/alunos", color: "from-emerald-600/20 to-emerald-600/5", border: "border-emerald-500/20" },
    { label: "Presenças", icon: ClipboardList, href: "/dashboard/professor/presencas", color: "from-yellow-600/20 to-yellow-600/5", border: "border-yellow-500/20" },
    { label: "Graduações", icon: GraduationCap, href: "/dashboard/professor/graduacoes", color: "from-purple-600/20 to-purple-600/5", border: "border-purple-500/20" },
    { label: "Relatórios", icon: FileText, href: "/dashboard/professor/relatorios", color: "from-pink-600/20 to-pink-600/5", border: "border-pink-500/20" },
    { label: "Config", icon: Settings, href: "/dashboard/professor/config", color: "from-gray-600/20 to-gray-600/5", border: "border-gray-500/20" },
  ]

  return (
    <DashboardShell role="professor">
      <PageTransition>
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Tech Hero */}
          <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-[rgba(201,168,76,0.08)] via-[rgba(10,10,10,0.8)] to-[rgba(10,10,10,0.9)] p-6">
            <div className="absolute top-[-60px] right-[-60px] w-40 h-40 bg-[var(--gold)]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-[-40px] left-[-40px] w-32 h-32 bg-[var(--gold)]/3 rounded-full blur-3xl" />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-[var(--gold)]" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--gold)]">Professor</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight">{t("titulo")}</h1>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{professor.nome}</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-3 py-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="font-semibold">{atendimento}%</span>
                <span className="text-emerald-400/60">atendimento</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <button key={action.label} onClick={() => router.push(action.href)}
                  className={`relative overflow-hidden rounded-xl border ${action.border} p-3 text-center transition-all hover:scale-[1.02] active:scale-95 group`}
                  style={{ background: `linear-gradient(135deg, ${action.color.split(" ")[0].replace("from-", "")}, ${action.color.split(" ")[1].replace("to-", "")})` }}>
                  <Icon className="w-5 h-5 mx-auto mb-1.5 text-[var(--text-secondary)] group-hover:text-white transition-colors" />
                  <span className="text-[10px] font-semibold text-[var(--text-secondary)] group-hover:text-white transition-colors">{action.label}</span>
                  <ArrowUpRight className="w-3 h-3 absolute top-1.5 right-1.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              )
            })}
          </div>

          {/* Tech Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="tech-stat">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-4 h-4 text-[rgba(255,255,255,0.25)]" />
                <span className="live-dot" />
              </div>
              <div className="tech-stat-value"><AnimatedCounter value={stats.totalAlunos} /></div>
              <div className="tech-stat-label">{t("alunos")}</div>
            </div>
            <div className="tech-stat">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-4 h-4 text-[rgba(255,255,255,0.25)]" />
                <span className={`w-1.5 h-1.5 rounded-full ${stats.presencasHoje > 0 ? "bg-emerald-500" : "bg-gray-500"} inline-block`} />
              </div>
              <div className="tech-stat-value"><AnimatedCounter value={stats.presencasHoje} /></div>
              <div className="tech-stat-label">{t("presencasHoje")}</div>
            </div>
            <div className="tech-stat">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-4 h-4 text-[rgba(255,255,255,0.25)]" />
                <span className={`w-1.5 h-1.5 rounded-full ${stats.presencasPendentes > 0 ? "bg-yellow-500" : "bg-gray-500"} inline-block`} />
              </div>
              <div className="tech-stat-value"><AnimatedCounter value={stats.presencasPendentes} /></div>
              <div className="tech-stat-label">{t("pendentes")}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tab-bar">
            <button className={`tab-btn gap-1.5 ${tab === "geral" ? "active" : ""}`} onClick={() => setTab("geral")}>
              <ClipboardList className="w-4 h-4" /> {t("geral")}
            </button>
            <button className={`tab-btn gap-1.5 ${tab === "presencas" ? "active" : ""}`} onClick={() => setTab("presencas")}>
              <CheckCircle className="w-4 h-4" /> {t("presencas")}
            </button>
          </div>

          {/* Tab: Geral */}
          {tab === "geral" && !presencasHoje.length && (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-[var(--gold)] mx-auto mb-3" />
              <p className="text-2xl font-black">{t("semAulasHoje")}</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{t("descEmpty")}</p>
            </div>
          )}

          {tab === "geral" && presencasHoje.length > 0 && (
            <div className="tech-card p-5">
              <div className="section-header">{t("presencasDoDia")}</div>
              <p className="text-[10px] text-[var(--text-muted)] mb-3">{new Date().toLocaleDateString("pt-BR")}</p>
              <div className="space-y-0.5">
                {presencasHoje.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-[rgba(255,255,255,0.03)] last:border-0">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-semibold text-sm">{p.aluno.nome}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{p.horario}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.status === "pending" ? (
                        <>
                          <button onClick={() => confirmar(p.id)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                            <CheckCircle className="w-3.5 h-3.5" /> Confirmar
                          </button>
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            <XCircle className="w-3.5 h-3.5" /> {t("pendente")}
                          </span>
                        </>
                      ) : (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3.5 h-3.5" /> {t("confirmado")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Presenças */}
          {tab === "presencas" && (
            <div className="tech-card p-5">
              <div className="section-header">{t("presencas")}</div>
              {presencasHoje.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-10 h-10 text-[var(--gold)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--text-secondary)]">{t("nenhumaPresenca")}</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {presencasHoje.map(p => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-semibold text-sm">{p.aluno.nome}</div>
                          <div className="text-xs text-[var(--text-secondary)]">{p.horario}</div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                        p.status === "confirmed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      }`}>
                        {p.status === "confirmed" ? t("presente") : t("pendente")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Turmas */}
          {turmas.length > 0 && (
            <div className="tech-card p-5">
              <div className="section-header">{t("minhasTurmas")}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {turmas.map((t) => (
                  <div key={t.id} className="surface p-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm">{t.nome}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{t.dias} · {t.horario}</div>
                    </div>
                    <span className="badge">{t.totalAlunos}/{t.maxAlunos}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alunos */}
          {alunos.length > 0 && tab === "geral" && (
            <div className="tech-card p-5">
              <div className="section-header">{t("alunos")}</div>
              <div className="space-y-1">
                {alunos.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0">
                    <span className="font-semibold text-sm">{a.nome}</span>
                    <span className="text-xs text-[var(--text-secondary)]">{a.faixa}</span>
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

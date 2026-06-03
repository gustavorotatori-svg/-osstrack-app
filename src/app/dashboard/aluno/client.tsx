"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { PageTransition } from "@/components/ui/page-transition"
import { Celebration } from "@/components/ui/celebration"
import { ConviteSection } from "@/components/convites/convite-section"
import { CheckIcon, FlameIcon, AwardIcon, DumbbellIcon, GraduationIcon, Share2Icon } from "@/components/ui/icons"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"
import { DailyMissions } from "@/components/gamification/daily-missions"
import { MetaSemanalCard } from "@/components/gamification/meta-semanal-card"
import { MestreDoMesCard } from "@/components/gamification/mestre-do-mes-card"
import { PremiumBanner } from "@/components/ui/premium-lock"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useT } from "@/lib/use-t"

const belts = [
  { name: "Branca", color: "bg-white", text: "text-black" },
  { name: "Azul", color: "bg-blue-600", text: "text-white" },
  { name: "Roxa", color: "bg-purple-600", text: "text-white" },
  { name: "Marrom", color: "bg-amber-800", text: "text-white" },
  { name: "Preta", color: "bg-gray-900", text: "text-[var(--gold)]" },
]

type Props = {
  aluno: { id: string; nome: string; faixa: string; grau: number; totalAulas: number; dataInicio: string; academia: string }
  graduacao: { aulasPorGrau: number; aulasProxFx: number | null; graus: number } | null
  ultimasPresencas: { id: string; data: string; horario: string; status: string; turma: string }[]
  conquistas: { id: string; nome: string; icone: string; descricao: string; desbloqueada: boolean }[]
  streak: number
}

export function StudentDashboardClient({ aluno, graduacao, ultimasPresencas, conquistas, streak: streakInicial }: Props) {
  const t = useT("aluno.dashboard")
  const router = useRouter()
  const [treinandoAgora, setTreinandoAgora] = useState<{ nome: string; faixa: string }[]>([])
  const [celebrate, setCelebrate] = useState<{ show: boolean; title: string }>({ show: false, title: "" })
  const jaTreinouHoje = ultimasPresencas.some(p => {
    const hoje = new Date()
    const d = new Date(p.data)
    return d.getDate() === hoje.getDate() && d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear() && p.status === "confirmed"
  })

  useEffect(() => {
    if (streakInicial >= 5 && streakInicial % 5 === 0) {
      setCelebrate({ show: true, title: t("streakDias").replace("{n}", String(streakInicial)) })
    }
  }, [])

  useEffect(() => {
    fetch("/api/treino").then(r => r.json()).then(d => setTreinandoAgora(d.treinando || [])).catch(() => {})
    const id = setInterval(() => {
      fetch("/api/treino").then(r => r.json()).then(d => setTreinandoAgora(d.treinando || [])).catch(() => {})
    }, 30000)
    return () => clearInterval(id)
  }, [])

  async function fazerCheckin() {
    if (!navigator.geolocation) { toast.error(t("geolocalizacaoIndisponivel")); return }
    toast.loading(t("verificandoLocalizacao"))
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/presenca", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          })
          if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Erro") }
          toast.success(t("checkinSucesso"))
          router.refresh()
        } catch (e: any) { toast.error(e.message || t("erroCheckin")) }
      },
      () => { toast.error(t("localizacaoNegada")) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const classesProxGrau = graduacao ? (aluno.grau + 1) * graduacao.aulasPorGrau : 0
  const progressoGrau = graduacao ? Math.min(100, (aluno.totalAulas / classesProxGrau) * 100) : 0
  const restamGrau = Math.max(0, classesProxGrau - aluno.totalAulas)
  const progressoFaixa = graduacao?.aulasProxFx ? Math.min(100, (aluno.totalAulas / graduacao.aulasProxFx) * 100) : null
  const restamFaixa = graduacao?.aulasProxFx ? Math.max(0, graduacao.aulasProxFx - aluno.totalAulas) : null
  const currentBeltIdx = belts.findIndex(b => b.name === aluno.faixa)
  const quoteIndex = new Date().getDate() % 10
  const conqueredCount = conquistas.filter(c => c.desbloqueada).length
  const mostraCompartilhar = conqueredCount > 0 || streakInicial >= 5

  return (
    <DashboardShell role="aluno">
      <Celebration show={celebrate.show} title={celebrate.title} onDone={() => setCelebrate({ show: false, title: "" })} />
      <PageTransition>
        <div className="max-w-5xl mx-auto space-y-4">

          {/* Hero */}
          <div className="text-center py-4">
            <div className="mx-auto mb-3"><Avatar name={aluno.nome} faixa={aluno.faixa} size={80} /></div>
            <h1 className="text-2xl font-extrabold tracking-tight">{aluno.nome}</h1>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded text-xs font-bold ${getBeltColor(aluno.faixa)}`}>
                {getBeltEmoji(aluno.faixa)} {aluno.faixa} · {aluno.grau + 1}º G
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{aluno.academia}</p>
          </div>

          {/* Check-in */}
          {jaTreinouHoje ? (
            <div className="surface p-5 text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--red-dim)] flex items-center justify-center mx-auto mb-3">
                <CheckIcon className="w-7 h-7 text-[var(--red)]" />
              </div>
              <p className="font-bold text-lg">{t("treinoHoje")}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{treinandoAgora.length > 0 ? `${treinandoAgora.length} pessoas treinando agora` : t("registrado")}</p>
            </div>
          ) : (
            <button onClick={fazerCheckin} className="btn-primary w-full rounded p-6 text-center">
              <DumbbellIcon className="w-10 h-10 mx-auto mb-2" />
              <p className="font-extrabold text-xl">{t("chegouHoje")}</p>
              <p className="text-xs text-white/60 mt-1">{t("registrePresenca")}</p>
            </button>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 py-2">
            <div className="stat">
              <div className="stat-value">{aluno.totalAulas}</div>
              <div className="stat-label">{t("aulas")}</div>
            </div>
            <div className="stat">
              <div className="stat-value">{streakInicial}</div>
              <div className="stat-label">{t("sequencia")}</div>
            </div>
            <div className="stat">
              <div className="stat-value">{conqueredCount}</div>
              <div className="stat-label">{t("conquistas")}</div>
            </div>
          </div>

          {/* Treinando agora */}
          {treinandoAgora.length > 0 && !jaTreinouHoje && (
            <div className="flex items-center gap-3 py-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-400 font-semibold">{treinandoAgora.length} {t("treinandoAgora").toLowerCase()}</span>
            </div>
          )}

          {/* Jornada */}
          <div className="space-y-4 py-2">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="section-header">{t("proximoGrau")}</span>
                <span className="text-[10px] text-[var(--gold)]">{t("aulasRestam").replace("{n}", String(restamGrau))}</span>
              </div>
              <div className="progress"><div className="progress-fill-gold" style={{ width: `${progressoGrau}%` }} /></div>
            </div>
            {progressoFaixa !== null && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="section-header">{t("proximaFaixa")}</span>
                  <span className="text-[10px] text-[var(--gold)]">{t("aulasRestam").replace("{n}", String(restamFaixa))}</span>
                </div>
                <div className="progress"><div className="progress-fill-gold" style={{ width: `${progressoFaixa}%` }} /></div>
              </div>
            )}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {belts.map((belt, idx) => {
                const isCurrent = idx === currentBeltIdx
                const isCompleted = idx < currentBeltIdx
                return (
                  <div key={belt.name} className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold ${
                    isCurrent ? "text-[var(--gold)] bg-[var(--gold-dim)]" :
                    isCompleted ? "text-emerald-400" : "text-[var(--text-muted)]"
                  }`}>
                    {belt.name}
                    {isCompleted && <CheckIcon className="w-2.5 h-2.5" />}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Share */}
          {mostraCompartilhar && (
            <button onClick={() => router.push("/dashboard/aluno/compartilhar")}
              className="btn-ghost w-full rounded p-4 flex items-center gap-3">
              <Share2Icon className="w-5 h-5" />
              <div className="text-left flex-1">
                <p className="font-bold text-sm">{t("compartilharMomento")}</p>
                <p className="text-xs text-[var(--text-secondary)]">{t("gerarArte")}</p>
              </div>
            </button>
          )}

          {/* Feed */}
          <div className="space-y-3">
            {ultimasPresencas.length > 0 && (
              <div>
                <div className="section-header">{t("ultimosCheckins")}</div>
                <div className="space-y-1">
                  {ultimasPresencas.slice(0, 4).map((p) => (
                    <div key={p.id} className="flex items-center gap-3 py-2.5">
                      <div className={`w-8 h-8 flex items-center justify-center ${p.status === "confirmed" ? "bg-[var(--red-dim)]" : "bg-yellow-500/10"}`}>
                        {p.status === "confirmed" ? <CheckIcon className="w-4 h-4 text-[var(--red)]" /> : <DumbbellIcon className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.turma || t("treino")}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{new Date(p.data).toLocaleDateString()} às {p.horario}</p>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded ${p.status === "confirmed" ? "text-[var(--red)]" : "text-yellow-400"}`}>
                        {p.status === "confirmed" ? t("presente") : t("pendente")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <MetaSemanalCard />
            <MestreDoMesCard />
            <DailyMissions />

            {!mostraCompartilhar && <PremiumBanner onClick={() => router.push("/dashboard/aluno/premium")} />}

            <ConviteSection tipo="amigo" />
          </div>

        </div>
      </PageTransition>
    </DashboardShell>
  )
}

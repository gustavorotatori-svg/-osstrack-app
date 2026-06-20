"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Avatar } from "@/components/ui/avatar"
import { getBeltColor, getBeltEmoji } from "@/lib/utils"
import { useT } from "@/lib/use-t"
import { LockIcon, CrownIcon, AwardIcon, ClipboardIcon, DumbbellIcon, UsersIcon, CalendarIcon, FlameIcon } from "@/components/ui/icons"
import { getNivelInfo } from "@/lib/disciplina"
import { PageTransition } from "@/components/ui/page-transition"
import { toast } from "sonner"

type RankingItem = {
  id: string; nome: string; faixa: string; grau: number; avatar: string | null; categoria: string; totalAulas: number; posicao: number; nivelDisciplina: string | null
}

type Props = {
  initialRanking: RankingItem[]
  alunoId: string
  belts: string[]
  initialMestre: { nome: string; faixa: string; grau: number; avatar: string | null; totalAulas: number } | null
  visivel: boolean
}

export function RankingClient({ initialRanking, alunoId, belts, initialMestre, visivel }: Props) {
  const t = useT("aluno.ranking")
  const [ranking, setRanking] = useState<RankingItem[]>(initialRanking)
  const [mestre, setMestre] = useState(initialMestre)
  const [beltFilter, setBeltFilter] = useState("Todas")
  const [categoriaFilter, setCategoriaFilter] = useState("geral")
  const [periodoFilter, setPeriodoFilter] = useState("total")
  const [filterLoading, setFilterLoading] = useState(false)
  const [filterError, setFilterError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    if (categoriaFilter !== "geral") params.set("categoria", categoriaFilter)
    if (beltFilter !== "Todas") params.set("faixa", beltFilter)
    if (periodoFilter !== "total") params.set("periodo", periodoFilter)

    setFilterLoading(true)
    setFilterError(null)
    fetch(`/api/ranking?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => { setRanking(d.ranking || []); setMestre(d.mestre); setFilterLoading(false) })
      .catch(() => { setFilterError("Erro ao carregar ranking"); setFilterLoading(false); toast.error("Erro ao carregar ranking") })
  }, [categoriaFilter, beltFilter, periodoFilter])

  if (!visivel) {
    return (
      <DashboardShell role="aluno">
        <div className="glass-card text-center py-12">
          <LockIcon className="w-10 h-10 mb-3 mx-auto" />
          <h3 className="font-bold text-base">{t("desativado")}</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-2">{t("desativadoDesc")}</p>
        </div>
      </DashboardShell>
    )
  }

  const myPos = ranking.findIndex((a) => a.id === alunoId)
  const firstInRanking = ranking[0]

  return (
    <DashboardShell role="aluno">
      <PageTransition>
        <div className="max-w-5xl mx-auto space-y-4">
          {mestre && (
            <div className="glass-card border border-[var(--gold-dim)] p-5 text-center relative overflow-hidden">
              <CrownIcon className="absolute top-[-10px] right-[-10px] w-16 h-16 opacity-[0.06]" />
              <CrownIcon className="w-8 h-8 mb-1 animate-float mx-auto" />
              <h3 className="font-bold text-sm text-[var(--gold)] uppercase tracking-widest">{t("mestreDoMes")}</h3>
              <div className="w-12 h-[1px] bg-[var(--gold)]/30 mx-auto my-3" />
              <p className="text-lg font-extrabold mt-0.5">{mestre.nome}</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold mt-2 ${getBeltColor(mestre.faixa)}`}>
                {getBeltEmoji(mestre.faixa)} {mestre.faixa} · {mestre.grau + 1}º Grau
              </span>
              <p className="text-xs text-[var(--text-secondary)] mt-2">{t("aulasNoMes").replace("{n}", String(mestre.totalAulas))}</p>
            </div>
          )}

          <div className="glass-card text-center p-5">
            <AwardIcon className="w-8 h-8 mb-2 mx-auto" />
            <h3 className="font-bold">{t("title")}</h3>
            <p className="text-xs text-[var(--text-secondary)]">{t("subtitle")}</p>
          </div>

          {/* Filtros */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {["Todas", ...belts].map((b) => (
              <button key={b} onClick={() => setBeltFilter(b)}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  beltFilter === b ? "bg-[var(--red)] text-white shadow-md" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]"
                }`}
              >
                {b === "Todas" ? <><ClipboardIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />{t("todas")}</> : `${getBeltEmoji(b)} ${b}`}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button onClick={() => setCategoriaFilter("geral")}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                categoriaFilter === "geral" ? "bg-[var(--red)] text-white shadow-md" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]"
              }`}>
              <ClipboardIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />{t("geral")}
            </button>
            {["adulto", "master", "infantil"].map((cat) => (
              <button key={cat} onClick={() => setCategoriaFilter(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${
                  categoriaFilter === cat ? "bg-[var(--red)] text-white shadow-md" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]"
                }`}>
                {cat === "adulto" ? <><DumbbellIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />{t("adulto")}</> : cat === "master" ? <><DumbbellIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />{t("master")}</> : <><UsersIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />{t("infantil")}</>}
              </button>
            ))}
            <button onClick={() => setPeriodoFilter(periodoFilter === "mes" ? "total" : "mes")}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                periodoFilter === "mes" ? "bg-[var(--red)] text-white shadow-md" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]"
              }`}>
              {periodoFilter === "mes" ? <><CalendarIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />{t("esteMes")}</> : <><CalendarIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />{t("total")}</>}
            </button>
          </div>

          {/* Lista */}
          <div className="glass-card overflow-hidden">
            {filterError ? (
              <div className="text-center py-8">
                <p className="text-sm text-[var(--text-secondary)]">{filterError}</p>
                <button onClick={() => window.location.reload()} className="btn-primary mt-4 px-6 py-2 text-xs font-bold rounded-xl">
                  Tentar novamente
                </button>
              </div>
            ) : filterLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3.5 animate-pulse">
                    <div className="w-8 h-8 rounded-xl bg-[var(--border)]" />
                    <div className="w-8 h-8 rounded-full bg-[var(--border)]" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-28 rounded bg-[var(--border)]" />
                      <div className="h-2.5 w-20 rounded bg-[var(--border)]" />
                    </div>
                    <div className="text-right space-y-1">
                      <div className="h-3.5 w-8 rounded bg-[var(--border)] ml-auto" />
                      <div className="h-2 w-6 rounded bg-[var(--border)] ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : ranking.length === 0 ? (
              <div className="text-center py-8 text-sm text-[var(--text-secondary)]">{t("nenhumAluno")}</div>
            ) : (
              ranking.map((a) => {
                const isMe = a.id === alunoId
                return (
                  <div key={a.id}
                    className={`flex items-center gap-3.5 px-4 py-3 border-b border-[var(--border)] last:border-0 transition-all ${
                      isMe ? "bg-[var(--gold-dim)]" : "hover:bg-[var(--border)]/50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                      a.posicao === 1 ? "bg-[var(--gold)] text-black shadow-md" : a.posicao === 2 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-black" : a.posicao === 3 ? "bg-gradient-to-br from-amber-700 to-amber-800 text-white" : "bg-[var(--border)] text-[var(--text-secondary)]"
                    }`}>
                      {a.posicao}
                    </div>
                    <Avatar name={a.nome} faixa={a.faixa} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {mestre && mestre.nome === a.nome && <CrownIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-0.5" />}
                        {isMe && <span className="mr-0.5 text-[var(--gold)]">›</span>}
                        {a.nome}
                        {getNivelInfo(a.nivelDisciplina) && (
                          <span className="ml-1 text-xs" title={getNivelInfo(a.nivelDisciplina)!.label}>
                            {getNivelInfo(a.nivelDisciplina)!.icone}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full inline-block ${getBeltColor(a.faixa).split(" ")[0]}`} />
                        {a.faixa} · {'★'.repeat(a.grau + 1)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-[var(--gold)]">{a.totalAulas}</div>
                      <div className="text-[9px] text-[var(--text-muted)]">{t("aulas")}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {myPos >= 0 && (
            <div className="glass-card text-center p-4">
              <p className="text-xs text-[var(--text-secondary)]">
                <FlameIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
                {beltFilter !== "Todas"
                  ? t("posicaoFaixa").replace("{pos}", String(myPos + 1)).replace("{faixa}", beltFilter)
                  : t("posicao").replace("{pos}", String(myPos + 1))}
              </p>
              {myPos > 0 && firstInRanking && (
                <p className="text-xs text-[var(--gold)] mt-1">
                  {t("faltamAulas").replace("{n}", String(firstInRanking.totalAulas - ranking[myPos].totalAulas))}
                </p>
              )}
            </div>
          )}
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

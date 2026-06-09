"use client"

import { useT } from "@/lib/use-t"
import { useState, useEffect, useCallback } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { TreinoTimer } from "@/components/treino/treino-timer"
import { Play, Check, Clock, History, Dumbbell, Target, ChevronDown, ChevronUp, Flame, BarChart3 } from "lucide-react"

type Exercise = {
  id: string
  nome: string
  categoria: string
  series: number
  repeticoes: string
  carga: string
}

type Session = {
  id: string
  data: string
  duracao: number
  exercicios: Exercise[]
}

const EXERCICIOS_PRE = [
  { id: "drill1", nome: "Granby Roll", categoria: "Drills" },
  { id: "drill2", nome: "Shrimp Escape", categoria: "Drills" },
  { id: "drill3", nome: "Technical Stand-up", categoria: "Drills" },
  { id: "drill4", nome: "Forward Roll", categoria: "Drills" },
  { id: "tech1", nome: "Triangle from Guard", categoria: "Técnicas" },
  { id: "tech2", nome: "Armbar from Mount", categoria: "Técnicas" },
  { id: "tech3", nome: "Rear Naked Choke", categoria: "Técnicas" },
  { id: "tech4", nome: "Kimura from Side Control", categoria: "Técnicas" },
  { id: "tech5", nome: "Sweep from Closed Guard", categoria: "Técnicas" },
  { id: "tech6", nome: "Passing Guard", categoria: "Técnicas" },
  { id: "spar1", nome: "Positional Sparring", categoria: "Sparring" },
  { id: "spar2", nome: "Free Rolling", categoria: "Sparring" },
  { id: "spar3", nome: "King of the Hill", categoria: "Sparring" },
  { id: "cond1", nome: "Burpees", categoria: "Condicionamento" },
  { id: "cond2", nome: "Jump Rope", categoria: "Condicionamento" },
  { id: "cond3", nome: "Push-ups", categoria: "Condicionamento" },
]

export default function TreinoPage() {
  const t = useT("aluno.treino")
  const [showTimer, setShowTimer] = useState(false)
  const [exercicios, setExercicios] = useState<Exercise[]>([])
  const [selectedEx, setSelectedEx] = useState("")
  const [series, setSeries] = useState(3)
  const [repeticoes, setRepeticoes] = useState("")
  const [carga, setCarga] = useState("")
  const [historico, setHistorico] = useState<Session[]>([])
  const [showHistorico, setShowHistorico] = useState(false)
  const [treinandoAgora, setTreinandoAgora] = useState<{ nome: string; faixa: string }[]>([])
  const [startedAt, setStartedAt] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/treino").then((r) => r.json()).then((data) => setTreinandoAgora(data.treinando || [])).catch(() => {})
    const saved = localStorage.getItem("osstrack_historico_treino")
    if (saved) setHistorico(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem("osstrack_historico_treino", JSON.stringify(historico))
  }, [historico])

  const addExercicio = useCallback(() => {
    if (!selectedEx) return
    const ex = EXERCICIOS_PRE.find(e => e.id === selectedEx)
    if (!ex) return
    setExercicios(prev => [...prev, {
      id: `${ex.id}-${Date.now()}`,
      nome: ex.nome,
      categoria: ex.categoria,
      series,
      repeticoes,
      carga,
    }])
    setSelectedEx("")
    setSeries(3)
    setRepeticoes("")
    setCarga("")
  }, [selectedEx, series, repeticoes, carga])

  const finalizarTreino = useCallback(() => {
    if (exercicios.length === 0) return
    const duracao = startedAt ? Math.round((Date.now() - startedAt) / 60000) : 0
    const session: Session = {
      id: `sess-${Date.now()}`,
      data: new Date().toISOString(),
      duracao,
      exercicios,
    }
    setHistorico(prev => [session, ...prev].slice(0, 30))
    setExercicios([])
    setStartedAt(null)
    setShowTimer(false)
  }, [exercicios, startedAt])

  const iniciarTreino = useCallback(() => {
    setShowTimer(true)
    setStartedAt(Date.now())
  }, [])

  const categorias = [...new Set(EXERCICIOS_PRE.map(e => e.categoria))]
  const totalTreinos = historico.length
  const totalExercicios = historico.reduce((acc, s) => acc + s.exercicios.length, 0)
  const streak = [...new Set(historico.map(s => new Date(s.data).toDateString()))].length

  return (
    <DashboardShell role="aluno">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* Tech Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-[rgba(201,168,76,0.08)] via-[rgba(10,10,10,0.8)] to-[rgba(10,10,10,0.9)] p-6">
          <div className="absolute top-[-60px] right-[-60px] w-40 h-40 bg-[var(--gold)]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-40px] left-[-40px] w-32 h-32 bg-[var(--gold)]/3 rounded-full blur-3xl" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--gold)]">Diário de Treino</span>
              <h1 className="text-2xl font-black tracking-tight">{t("title")}</h1>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{t("subtitle")}</p>
            </div>
            {totalTreinos > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl px-3 py-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span className="font-semibold">{streak}</span>
                <span className="text-emerald-400/60">dias com treino</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats mini */}
        <div className="grid grid-cols-3 gap-2">
          <div className="tech-stat p-3">
            <div className="tech-stat-value text-lg"><span>{totalTreinos}</span></div>
            <div className="tech-stat-label">Treinos</div>
          </div>
          <div className="tech-stat p-3">
            <div className="tech-stat-value text-lg"><span>{totalExercicios}</span></div>
            <div className="tech-stat-label">Exercícios</div>
          </div>
          <div className="tech-stat p-3">
            <div className="tech-stat-value text-lg"><span>{totalTreinos > 0 ? Math.round(historico.reduce((a, s) => a + s.duracao, 0) / totalTreinos) : 0}</span><span className="text-xs text-[var(--text-muted)] ml-0.5">min</span></div>
            <div className="tech-stat-label">Média</div>
          </div>
        </div>

        {!showTimer && (
          <button onClick={iniciarTreino} className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--gold)] to-[#e8c84a] text-black font-bold text-base flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[var(--gold)]/20 transition-all active:scale-[0.98]">
            <Play className="w-5 h-5" /> Iniciar Treino
          </button>
        )}

        {/* Timer + Exercise logging side by side */}
        {showTimer && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="tech-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--gold)]" />
                  <span className="section-header mb-0">Timer</span>
                </div>
              </div>
              <TreinoTimer />
            </div>

            <div className="tech-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-[var(--gold)]" />
                  <span className="section-header mb-0">Exercícios</span>
                </div>
                <span className="badge">{exercicios.length}</span>
              </div>

              {/* Add exercise */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {categorias.map(cat => (
                  <span key={cat} className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wide w-full">{cat}</span>
                ))}
                {categorias.map(cat => (
                  EXERCICIOS_PRE.filter(e => e.categoria === cat).map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => setSelectedEx(ex.id)}
                      className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                        selectedEx === ex.id ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]" : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)] hover:text-white"
                      }`}
                    >
                      {ex.nome}
                    </button>
                  ))
                ))}
              </div>

              {selectedEx && (
                <div className="flex items-center gap-2 mb-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
                  <div className="flex gap-1 text-xs">
                    <input type="number" min={1} max={20} value={series} onChange={e => setSeries(+e.target.value)} className="w-10 text-center bg-transparent border border-[rgba(255,255,255,0.1)] rounded-lg p-1 text-[var(--text)]" />
                    <span className="self-center text-[var(--text-secondary)]">x</span>
                    <input type="text" placeholder="reps" value={repeticoes} onChange={e => setRepeticoes(e.target.value)} className="w-14 text-center bg-transparent border border-[rgba(255,255,255,0.1)] rounded-lg p-1 text-[var(--text)]" />
                    <input type="text" placeholder="carga" value={carga} onChange={e => setCarga(e.target.value)} className="w-14 text-center bg-transparent border border-[rgba(255,255,255,0.1)] rounded-lg p-1 text-[var(--text)]" />
                  </div>
                  <button onClick={addExercicio} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[var(--gold)] text-black">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Exercise list */}
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {exercicios.map((ex, i) => (
                  <div key={ex.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-[rgba(255,255,255,0.02)] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-[var(--text-muted)]">{i + 1}</span>
                      <span className="font-semibold">{ex.nome}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <span>{ex.series}x{ex.repeticoes || "-"}</span>
                      {ex.carga && <span className="text-[var(--gold)]">{ex.carga}kg</span>}
                    </div>
                  </div>
                ))}
                {exercicios.length === 0 && (
                  <p className="text-xs text-[var(--text-muted)] text-center py-4">Selecione os exercícios acima</p>
                )}
              </div>

              <button onClick={finalizarTreino} disabled={exercicios.length === 0} className="w-full mt-3 py-2.5 rounded-xl font-bold text-xs bg-emerald-600/80 text-white hover:bg-emerald-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                Finalizar Treino ({exercicios.length} exercícios)
              </button>
            </div>
          </div>
        )}

        {/* History toggle */}
        {historico.length > 0 && (
          <>
            <button onClick={() => setShowHistorico(!showHistorico)} className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-white transition-colors">
              <History className="w-3.5 h-3.5" />
              Histórico ({historico.length} treinos)
              {showHistorico ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showHistorico && (
              <div className="tech-card p-5">
                <div className="section-header">Últimos Treinos</div>
                <div className="space-y-2">
                  {historico.slice(0, 10).map(s => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0">
                      <div>
                        <span className="text-xs font-semibold">{new Date(s.data).toLocaleDateString("pt-BR")}</span>
                        <span className="text-[10px] text-[var(--text-secondary)] ml-2">{s.exercicios.length} ex · {s.duracao}min</span>
                      </div>
                      <div className="flex gap-1">
                        {s.exercicios.slice(0, 3).map((ex, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)]">{ex.nome.split(" ")[0]}</span>
                        ))}
                        {s.exercicios.length > 3 && <span className="text-[9px] text-[var(--text-muted)]">+{s.exercicios.length - 3}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Treinando agora */}
        {treinandoAgora.length > 0 && (
          <div className="tech-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="section-header mb-0">{t("treinandoAgora")}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {treinandoAgora.map((p, i) => (
                <div key={i} className="flex items-center gap-2 bg-[var(--red-dim)] border border-[var(--red)]/20 rounded-xl px-3 py-1.5 text-xs">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="font-semibold">{p.nome}</span>
                  <span className="text-[var(--text-secondary)]">· {p.faixa}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

"use client"

const HOURS = Array.from({ length: 17 }, (_, i) => `${String(i + 6).padStart(2, "0")}:00`)

const DAYS = [
  { key: 0, label: "Dom", full: "Domingo" },
  { key: 1, label: "Seg", full: "Segunda" },
  { key: 2, label: "Ter", full: "Terça" },
  { key: 3, label: "Qua", full: "Quarta" },
  { key: 4, label: "Qui", full: "Quinta" },
  { key: 5, label: "Sex", full: "Sexta" },
  { key: 6, label: "Sáb", full: "Sábado" },
]

export type HorarioData = {
  id: string
  diaSemana: number
  horaInicio: string
  horaFim: string
  maxAlunos: number
  local?: string | null
  turma?: { id: string; nome: string } | null
  professor?: { id: string; nome: string; faixa?: string } | null
  _count?: { agendamentos: number }
}

interface WeeklyGridProps {
  horarios: HorarioData[]
  /** IDs de horarios ja agendados pelo aluno */
  bookedIds?: string[]
  /** Callback ao clicar numa celula vazia */
  onEmptyCell?: (day: number, hour: string) => void
  /** Callback ao clicar numa celula com aula */
  onClassCell?: (horario: HorarioData) => void
}

export function WeeklyGrid({ horarios, bookedIds = [], onEmptyCell, onClassCell }: WeeklyGridProps) {
  const grid = new Map<string, HorarioData[]>()
  for (const h of horarios) {
    const hour = h.horaInicio.slice(0, 5)
    const key = `${h.diaSemana}-${hour}`
    if (!grid.has(key)) grid.set(key, [])
    grid.get(key)!.push(h)
  }

  function getClasses(day: number, hour: string) {
    return grid.get(`${day}-${hour}`) || []
  }

  return (
    <div className="overflow-x-auto scrollbar-none rounded-2xl border border-[var(--dark-border)]">
      <div
        className="grid"
        style={{
          display: "grid",
          gridTemplateColumns: `56px repeat(7, minmax(100px, 1fr))`,
          minWidth: "756px",
        }}
      >
        {/* Header */}
        <div className="h-10 flex items-center justify-center text-[10px] text-[var(--white-muted)] font-semibold uppercase bg-[var(--dark-card)] border-b border-r border-[var(--dark-border)] sticky left-0 z-10">
          🥋
        </div>
        {DAYS.map((d) => (
          <div
            key={d.key}
            className={`h-10 flex items-center justify-center text-xs font-bold border-b border-r border-[var(--dark-border)] last:border-r-0 ${
              d.key === 0 || d.key === 6
                ? "text-[var(--white-muted)] bg-[var(--dark-card)]"
                : "text-[var(--gold)] bg-[var(--dark-card)]"
            }`}
          >
            {d.label}
          </div>
        ))}

        {/* Rows */}
        {HOURS.map((hour) => (
          <>
            <div
              key={`t-${hour}`}
              className="h-14 flex items-center justify-center text-[10px] text-[var(--white-muted)] font-mono bg-[var(--dark-card)] border-b border-r border-[var(--dark-border)] sticky left-0 z-10"
            >
              {hour}
            </div>
            {DAYS.map((day) => {
              const classes = getClasses(day.key, hour)
              return (
                <div
                  key={`${day.key}-${hour}`}
                  onClick={() => {
                    if (classes.length > 0) onClassCell?.(classes[0])
                    else onEmptyCell?.(day.key, hour)
                  }}
                  className="h-14 border-b border-r border-[var(--dark-border)] last:border-r-0 relative transition-colors hover:bg-[rgba(201,168,76,0.03)]"
                >
                  {classes.map((h) => {
                    const isBooked = bookedIds.includes(h.id)
                    return (
                      <div
                        key={h.id}
                        className={`absolute inset-0.5 rounded-lg flex flex-col items-center justify-center text-[10px] font-semibold leading-tight px-1 transition-all hover:scale-[1.02] ${
                          isBooked
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-[rgba(201,168,76,0.08)] text-[var(--gold)] border border-[rgba(201,168,76,0.15)]"
                        }`}
                      >
                        <span className="truncate w-full text-center leading-tight">
                          {h.turma?.nome || "Treino"}
                        </span>
                        {h.professor && (
                          <span className="text-[8px] opacity-60 truncate w-full text-center">
                            {h.professor.nome}
                          </span>
                        )}
                        <span className="text-[8px] opacity-70">
                          {h.horaInicio}-{h.horaFim}
                        </span>
                        {h._count && (
                          <span className="text-[8px] opacity-70">
                            {h._count.agendamentos}/{h.maxAlunos}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}

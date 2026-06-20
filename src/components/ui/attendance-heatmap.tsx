"use client"

import { useMemo } from "react"

interface PresencaData {
  data: string
  status: string
}

interface Props {
  presencas: PresencaData[]
  months?: string[]
  dayLabels?: string[]
}

const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

interface CellData {
  date: Date
  count: number
  level: number
}

function getLevel(count: number): number {
  if (count === 0) return 0
  if (count === 1) return 1
  if (count <= 2) return 2
  if (count <= 3) return 3
  if (count <= 4) return 4
  return 5
}

export function AttendanceHeatmap({ presencas, months = MONTHS_PT, dayLabels = DAYS_PT }: Props) {
  const { cells, monthLabels } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const oneYearAgo = new Date(today)
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const presencaMap = new Map<string, number>()
    for (const p of presencas) {
      if (p.status !== "confirmed") continue
      const d = new Date(p.data)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      presencaMap.set(key, (presencaMap.get(key) || 0) + 1)
    }

    const cells: CellData[] = []
    const monthLabels: { index: number; label: string }[] = []

    let lastMonth = -1
    let cellIndex = 0
    const current = new Date(oneYearAgo)

    while (current <= today) {
      const key = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`
      const count = presencaMap.get(key) || 0
      cells.push({ date: new Date(current), count, level: getLevel(count) })

      if (current.getMonth() !== lastMonth) {
        monthLabels.push({ index: cellIndex, label: months[current.getMonth()] })
        lastMonth = current.getMonth()
      }

      current.setDate(current.getDate() + 1)
      cellIndex++
    }

    return { cells, monthLabels }
  }, [presencas, months])

  const weeks: CellData[][] = []
  let currentWeek: CellData[] = []

  for (const cell of cells) {
    currentWeek.push(cell)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  if (currentWeek.length > 0) weeks.push(currentWeek)

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-0.5 min-w-0">
        <div className="flex gap-0.5 ml-8 mb-1">
          {monthLabels.map((m, i) => {
            const startCol = Math.floor(m.index / 7)
            const span = (() => {
              const next = monthLabels[i + 1]
              if (next) return Math.floor(next.index / 7) - startCol
              return weeks.length - startCol
            })()
            return (
              <div key={m.label} style={{ width: span * 12 + (span - 1) * 2 }} className="text-[0.5rem] text-[var(--text-muted)] font-medium text-left leading-none">
                {m.label}
              </div>
            )
          })}
        </div>
        {dayLabels.map((day, dayIdx) => (
          <div key={day} className="flex items-center gap-0.5">
            <span className="w-7 text-right text-[0.5rem] text-[var(--text-muted)] font-medium pr-1 leading-none">
              {dayIdx % 2 === 0 ? day : ""}
            </span>
            {weeks.map((week, weekIdx) => {
              const cell = week[dayIdx]
              if (!cell) return <div key={weekIdx} className="w-2.5 h-2.5" />
              return (
                <div
                  key={weekIdx}
                  className="w-2.5 h-2.5 rounded-[2px]"
                  data-level={cell.level}
                  style={{
                    backgroundColor: cell.level === 0
                      ? "rgba(255,255,255,0.03)"
                      : `rgba(34,197,94,${0.1 + cell.level * 0.16})`,
                  }}
                  title={`${cell.date.toLocaleDateString("pt-BR")} - ${cell.count} check-in${cell.count !== 1 ? "s" : ""}`}
                />
              )
            })}
          </div>
        ))}
        <div className="flex items-center gap-1 justify-end mt-1">
          <span className="text-[0.45rem] text-[var(--text-muted)]">Menos</span>
          {[0, 1, 2, 3, 4, 5].map((l) => (
            <div
              key={l}
              className="w-2 h-2 rounded-[2px]"
              style={{
                backgroundColor: l === 0 ? "rgba(255,255,255,0.03)" : `rgba(34,197,94,${0.1 + l * 0.16})`,
              }}
            />
          ))}
          <span className="text-[0.45rem] text-[var(--text-muted)]">Mais</span>
        </div>
      </div>
    </div>
  )
}

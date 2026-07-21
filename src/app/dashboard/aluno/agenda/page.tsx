"use client"

import { useT } from "@/lib/use-t"
import { useState, useEffect, useCallback } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { PageTransition } from "@/components/ui/page-transition"
import { WeeklyGrid, type HorarioData } from "@/components/agenda/weekly-grid"
import { toast } from "sonner"
import { CardSkeleton } from "@/components/ui/skeleton"

export default function AlunoAgendaPage() {
  const t = useT("aluno.agenda")
  const [horarios, setHorarios] = useState<HorarioData[]>([])
  const [meusAgendamentos, setMeusAgendamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingId, setBookingId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [hRes, aRes] = await Promise.all([
        fetch("/api/agenda/horarios"),
        fetch("/api/agenda/agendamentos"),
      ])
      if (hRes.ok) setHorarios(await hRes.json())
      if (aRes.ok) setMeusAgendamentos(await aRes.json())
    } catch { toast.error(t("erroCarregar") || "Erro ao carregar") }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const bookedHorarioIds = meusAgendamentos.map((a: any) => a.horarioId)

  async function handleBook(horario: HorarioData) {
    if (bookedHorarioIds.includes(horario.id)) {
      toast.info(t("jaAgendado"))
      return
    }
    if ((horario._count?.agendamentos ?? 0) >= horario.maxAlunos) {
      toast.error(t("turmaLotada"))
      return
    }

    setBookingId(horario.id)
    const data = new Date()
    const diff = (horario.diaSemana + 7 - data.getDay()) % 7
    const dataAgenda = new Date(data)
    dataAgenda.setDate(data.getDate() + diff)

    const res = await fetch("/api/agenda/agendamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        horarioId: horario.id,
        data: dataAgenda.toISOString().split("T")[0],
      }),
    })
    if (res.ok) {
      const novo = await res.json()
      setMeusAgendamentos((prev) => [novo, ...prev])
      toast.success(`${t("aulaAgendada")} 🥋`)
    } else {
      const err = await res.json()
      toast.error(err.error || t("erroAgendar"))
    }
    setBookingId(null)
  }

  return (
    <DashboardShell role="aluno">
      <PageTransition>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">📅 {t("title")}</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <WeeklyGrid
            horarios={horarios}
            bookedIds={bookedHorarioIds}
            onClassCell={(h) => {
              if (
                (h._count?.agendamentos ?? 0) >= h.maxAlunos
              ) {
                toast.error(t("turmaLotada"))
                return
              }
              handleBook(h)
            }}
          />
        )}

        {meusAgendamentos.length > 0 && (
          <div className="glass-card p-5">
            <h4 className="font-bold text-sm mb-3">📋 {t("meusAgendamentos")}</h4>
            <div className="space-y-2">
              {meusAgendamentos.slice(0, 5).map((a: any) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between bg-black/20 rounded-xl px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">
                      {a.horario?.turma?.nome || "Treino"}
                    </span>
                    <span className="text-[10px] text-[var(--gold)]">
                      {a.horario?.horaInicio}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    {new Date(a.data).toLocaleDateString("pt-BR")}
                  </span>
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

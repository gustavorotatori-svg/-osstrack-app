"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { WeeklyGrid, type HorarioData } from "@/components/agenda/weekly-grid"
import { toast } from "sonner"
import { CalendarIcon, XIcon, ClipboardIcon, DumbbellIcon } from "@/components/ui/icons"
import { useT } from "@/lib/use-t"

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const diaNomes = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

export default function ProfessorAgendaPage() {
  const t = useT("professor.agenda")
  const [horarios, setHorarios] = useState<HorarioData[]>([])
  const [turmas, setTurmas] = useState<{ id: string; nome: string; cor?: string; icone?: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedHour, setSelectedHour] = useState<string>("")

  const [turmaId, setTurmaId] = useState("")
  const [horaInicio, setHoraInicio] = useState("")
  const [horaFim, setHoraFim] = useState("")
  const [maxAlunos, setMaxAlunos] = useState(30)
  const [local, setLocal] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchHorarios = useCallback(async () => {
    try {
      const res = await fetch("/api/agenda/horarios")
      if (res.ok) setHorarios(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  const fetchTurmas = useCallback(async () => {
    try {
      const res = await fetch("/api/turmas")
      if (res.ok) setTurmas(await res.json())
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchHorarios(); fetchTurmas() }, [fetchHorarios, fetchTurmas])

  function openAddForm(day: number, hour: string) {
    setSelectedDay(day)
    setSelectedHour(hour)
    setHoraInicio(hour)
    const [h] = hour.split(":").map(Number)
    setHoraFim(`${String(h + 1).padStart(2, "0")}:00`)
    setTurmaId("")
    setMaxAlunos(30)
    setLocal("")
    setShowForm(true)
  }

  async function handleAddSlot(e: React.FormEvent) {
    e.preventDefault()
    if (!turmaId || !horaInicio || !horaFim) {
      toast.error(t("preenchaCampos"))
      return
    }
    setSaving(true)
    const res = await fetch("/api/agenda/horarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turmaId,
        professorId: "me",
        diaSemana: selectedDay ?? new Date().getDay(),
        horaInicio,
        horaFim,
        maxAlunos,
        local: local || undefined,
      }),
    })
    if (res.ok) {
      const novo = await res.json()
      setHorarios((prev) => [...prev, novo])
      toast.success(t("horarioCriado"))
      setShowForm(false)
    } else {
      const err = await res.json()
      toast.error(err.error || t("erroCriar"))
    }
    setSaving(false)
  }

  async function handleDeleteSlot(horario: HorarioData) {
    const res = await fetch(`/api/agenda/horarios?id=${horario.id}`, { method: "DELETE" })
    if (res.ok) {
      setHorarios((prev) => prev.filter((h) => h.id !== horario.id))
      toast.success(t("horarioRemovido"))
    } else {
      toast.error(t("erroRemover"))
    }
  }

  return (
    <DashboardShell role="professor">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="text-center">
          <h3 className="font-bold text-lg">{t("title")}</h3>
          <p className="text-xs text-[var(--text-secondary)]">{t("subtitle")}</p>
          <button
            onClick={() => {
              setShowForm(!showForm)
              if (!showForm) {
                const hoje = new Date().getDay()
                setSelectedDay(hoje)
                setSelectedHour("")
              }
            }}
            className="btn-primary px-4 py-2 text-sm mt-3"
          >
            {showForm ? <><XIcon className="w-4 h-4 inline -mt-0.5" /> {t("fechar")}</> : t("novoHorario")}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleAddSlot}
            className="surface p-5 space-y-4"
          >
            <h4 className="font-bold text-sm">
              {t("novoHorario")} —{" "}
              {selectedDay !== null ? diaNomes[selectedDay] : ""}
              {selectedHour ? ` às ${selectedHour}` : ""}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold">
                  {t("turma")}
                </label>
                <select
                  value={turmaId}
                  onChange={(e) => setTurmaId(e.target.value)}
                  className="input w-full text-sm mt-1"
                  required
                >
                  <option value="">{t("selecione")}</option>
                  {turmas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icone} {t.nome}
                    </option>
                  ))}
                </select>
                {turmas.length === 0 && (
                  <p className="text-[10px] text-[var(--text-muted)] mt-1"><ClipboardIcon className="w-3 h-3 inline -mt-0.5 mr-0.5" />{t("crieTurmasPrimeiro")}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold">
                  {t("dia")}
                </label>
                <select
                  value={selectedDay ?? 1}
                  onChange={(e) => setSelectedDay(Number(e.target.value))}
                  className="input w-full text-sm mt-1"
                >
                  {diasSemana.map((d, i) => (
                    <option key={d} value={i}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold">
                  {t("inicio")}
                </label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="input w-full text-sm mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold">
                  {t("fim")}
                </label>
                <input
                  type="time"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  className="input w-full text-sm mt-1"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold">
                  {t("maxAlunos")}
                </label>
                <input
                  type="number"
                  value={maxAlunos}
                  onChange={(e) => setMaxAlunos(Number(e.target.value))}
                  className="input w-full text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold">
                  {t("local")}
                </label>
                <input
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  className="input w-full text-sm mt-1"
                  placeholder={t("placeholderLocal")}
                />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn btn-primary px-6 py-2.5 text-sm font-bold">
              {saving ? t("salvando") : t("salvarHorario")}
            </button>
          </form>
        )}

        {loading ? (
          <div className="text-center py-20 text-[var(--text-secondary)] text-sm">{t("carregando")}</div>
        ) : (
          <WeeklyGrid
            horarios={horarios}
            onEmptyCell={openAddForm}
            onClassCell={(h) => {
              if (
                confirm(
                  `${t("confirmarExcluir")} "${h.turma?.nome || t("treino")}" (${h.horaInicio}-${h.horaFim})?`
                )
              )
                handleDeleteSlot(h)
            }}
          />
        )}
      </div>
    </DashboardShell>
  )
}

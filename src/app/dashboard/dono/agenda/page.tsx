"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { WeeklyGrid, type HorarioData } from "@/components/agenda/weekly-grid"
import { toast } from "sonner"
import { CalendarIcon, XIcon } from "@/components/ui/icons"
import { useT } from "@/lib/use-t"
import { CardSkeleton } from "@/components/ui/skeleton"
import { PageTransition } from "@/components/ui/page-transition"

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const diaNomes = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

export default function DonoAgendaPage() {
  const t = useT("dono.agenda")
  const [horarios, setHorarios] = useState<HorarioData[]>([])
  const [professores, setProfessores] = useState<{ id: string; nome: string; faixa?: string }[]>([])
  const [turmas, setTurmas] = useState<{ id: string; nome: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedHour, setSelectedHour] = useState<string>("")

  const [turmaId, setTurmaId] = useState("")
  const [professorId, setProfessorId] = useState("")
  const [horaInicio, setHoraInicio] = useState("")
  const [horaFim, setHoraFim] = useState("")
  const [maxAlunos, setMaxAlunos] = useState(30)
  const [local, setLocal] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchHorarios = useCallback(async () => {
    try {
      const res = await fetch("/api/agenda/horarios")
      if (res.ok) setHorarios(await res.json())
    } catch {
      toast.error(t("erroCarregarHorarios"))
    }
    setLoading(false)
  }, [])

  const fetchProfessores = useCallback(async () => {
    try {
      const res = await fetch("/api/professores")
      if (res.ok) setProfessores(await res.json())
      else setProfessores([])
    } catch {
      toast.error(t("erroCarregarProfessores"))
    }
  }, [])

  const fetchTurmas = useCallback(async () => {
    try {
      const res = await fetch("/api/turmas")
      if (res.ok) setTurmas(await res.json())
      else setTurmas([])
    } catch {
      toast.error(t("erroCarregarTurmas"))
    }
  }, [])

  useEffect(() => {
    fetchHorarios()
    fetchProfessores()
    fetchTurmas()
  }, [])

  const [editId, setEditId] = useState<string | null>(null)

  function openAddForm(day: number, hour: string) {
    setEditId(null)
    setSelectedDay(day)
    setSelectedHour(hour)
    setHoraInicio(hour)
    const [h] = hour.split(":").map(Number)
    setHoraFim(`${String(h + 1).padStart(2, "0")}:00`)
    setTurmaId("")
    setProfessorId("")
    setMaxAlunos(30)
    setLocal("")
    setShowForm(true)
  }

  function openEditForm(h: HorarioData) {
    setEditId(h.id)
    setSelectedDay(h.diaSemana)
    setSelectedHour(h.horaInicio)
    setHoraInicio(h.horaInicio)
    setHoraFim(h.horaFim)
    setTurmaId(h.turma?.id || "")
    setProfessorId(h.professor?.id || "")
    setMaxAlunos(h.maxAlunos || 30)
    setLocal(h.local || "")
    setShowForm(true)
  }

  async function handleAddSlot(e: React.FormEvent) {
    e.preventDefault()
    if (!turmaId || !professorId || !horaInicio || !horaFim) {
      toast.error(t("preenchaCampos"))
      return
    }
    setSaving(true)
    const isEdit = !!editId
    const url = isEdit ? `/api/agenda/horarios` : "/api/agenda/horarios"
    const method = isEdit ? "PUT" : "POST"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(isEdit ? { id: editId } : {}),
        turmaId,
        professorId,
        diaSemana: selectedDay ?? new Date().getDay(),
        horaInicio,
        horaFim,
        maxAlunos,
        local: local || undefined,
      }),
    })
    if (res.ok) {
      if (isEdit) {
        fetchHorarios()
        toast.success("Horário atualizado")
      } else {
        const novo = await res.json()
        setHorarios((prev) => [...prev, novo])
        toast.success(t("horarioCriado"))
      }
      setShowForm(false)
      setEditId(null)
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
    <DashboardShell role="dono">
      <PageTransition>
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="text-center">
            <h3 className="font-bold text-lg">{t("title")}</h3>
            <p className="text-xs text-[var(--text-secondary)]">{t("subtitle")}</p>
            <button
              onClick={() => {
                if (showForm) { setEditId(null); setShowForm(false) }
                else {
                  const hoje = new Date().getDay()
                  setSelectedDay(hoje); setSelectedHour(""); setEditId(null)
                }
                setShowForm(!showForm)
              }}
              className="btn-primary px-4 py-2 text-sm mt-3"
            >
              {showForm ? <><XIcon className="w-4 h-4 inline -mt-0.5" /> {t("fechar")}</> : t("novoHorario")}
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleAddSlot}
              className="glass-card p-5 space-y-4"
            >
              <h4 className="font-bold text-sm">
                {editId ? "Editar Horário" : t("novoHorario")} —{" "}
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
                    className="input-field w-full text-sm mt-1"
                    required
                  >
                    <option value="">{t("selecione")}</option>
                    {turmas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold">
                    {t("professor")}
                  </label>
                  <select
                    value={professorId}
                    onChange={(e) => setProfessorId(e.target.value)}
                    className="input-field w-full text-sm mt-1"
                    required
                  >
                    <option value="">{t("selecione")}</option>
                    {professores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} {p.faixa ? `(${p.faixa})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold">
                    {t("dia")}
                  </label>
                  <select
                    value={selectedDay ?? 1}
                    onChange={(e) => setSelectedDay(Number(e.target.value))}
                    className="input-field w-full text-sm mt-1"
                  >
                    {diasSemana.map((d, i) => (
                      <option key={d} value={i}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold">
                    {t("local")}
                  </label>
                  <input
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    className="input-field w-full text-sm mt-1"
                    placeholder={t("placeholderLocal")}
                  />
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
                    className="input-field w-full text-sm mt-1"
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
                    className="input-field w-full text-sm mt-1"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide font-semibold">
                  {t("maxAlunos")}
                </label>
                <input
                  type="number"
                  value={maxAlunos}
                  onChange={(e) => setMaxAlunos(Number(e.target.value))}
                  className="input-field w-full text-sm mt-1"
                />
              </div>
              <button type="submit" disabled={saving} className="btn-gold px-6 py-2.5 text-sm font-bold">
                {saving ? t("salvando") : editId ? "Salvar Alterações" : t("salvarHorario")}
              </button>
            </form>
          )}

          {loading ? (
            <div className="glass-card p-4 sm:p-6 space-y-4">
              <CardSkeleton />
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 14 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : (
            <WeeklyGrid
              horarios={horarios}
              onEmptyCell={openAddForm}
              onClassCell={(h) => {
                const action = confirm(
                  `Editar "${h.turma?.nome || t("treino")}"?\nOK = Editar | Cancelar = Excluir`
                )
                if (action) openEditForm(h)
                else if (confirm(`Excluir "${h.turma?.nome || t("treino")}" (${h.horaInicio}-${h.horaFim})?`))
                  handleDeleteSlot(h)
              }}
            />
          )}
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

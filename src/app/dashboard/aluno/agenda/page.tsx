"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const diaNomes = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

export default function AlunoAgendaPage() {
  const [diaSemana, setDiaSemana] = useState(new Date().getDay())
  const [horarios, setHorarios] = useState<any[]>([])
  const [meusAgendamentos, setMeusAgendamentos] = useState<any[]>([])
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    fetch(`/api/agenda/horarios?dia=${diaSemana}`).then(r => r.json()).then(setHorarios).catch(() => {})
    fetch("/api/agenda/agendamentos").then(r => r.json()).then(setMeusAgendamentos).catch(() => {})
  }, [diaSemana])

  async function agendar(horarioId: string) {
    setBooking(true)
    const data = new Date()
    const diff = (diaSemana + 7 - data.getDay()) % 7
    const dataAgenda = new Date(data)
    dataAgenda.setDate(data.getDate() + diff)

    const res = await fetch("/api/agenda/agendamentos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ horarioId, data: dataAgenda.toISOString().split("T")[0] }),
    })
    if (res.ok) {
      const novo = await res.json()
      setMeusAgendamentos((prev) => [novo, ...prev])
    } else {
      const err = await res.json()
      alert(err.error || "Erro ao agendar")
    }
    setBooking(false)
  }

  const agendadosHoje = meusAgendamentos.filter(a =>
    a.horario?.diaSemana === diaSemana &&
    new Date(a.data).toDateString() === new Date().toDateString()
  )

  return (
    <DashboardShell role="aluno">
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">📅</div>
          <h3 className="font-bold text-lg">Agenda de Aulas</h3>
          <p className="text-xs text-[var(--white-muted)]">Veja os horários e agende suas aulas</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {diasSemana.map((d, i) => (
            <button
              key={d}
              onClick={() => setDiaSemana(i)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                i === diaSemana ? "bg-[var(--gold)] text-black" : "bg-[var(--dark-card)] border border-[var(--dark-border)] text-[var(--white-muted)] hover:border-[var(--gold)]"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="text-xs text-[var(--gold)] font-semibold tracking-wide uppercase">{diaNomes[diaSemana]}</div>

        <div className="space-y-3">
          {horarios.map((h) => {
            const jaAgendado = agendadosHoje.some(a => a.horarioId === h.id)
            const vagas = h.maxAlunos - h._count.agendamentos
            return (
              <div key={h.id} className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm">{h.turma?.nome || "Treino"}</h4>
                      <span className="text-[9px] text-[var(--white-muted)]">· {h.professor?.nome}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs font-semibold text-[var(--gold)]">{h.horaInicio} - {h.horaFim}</span>
                      <span className="text-[10px] text-[var(--white-muted)]">{h.local || "Academia"}</span>
                    </div>
                    <div className="text-[10px] text-[var(--white-muted)] mt-1">{vagas} vagas restantes</div>
                  </div>
                  <button
                    onClick={() => agendar(h.id)}
                    disabled={booking || jaAgendado || vagas <= 0}
                    className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      jaAgendado ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : vagas <= 0 ? "bg-[var(--dark-border)] text-[var(--white-muted)] cursor-not-allowed"
                      : "btn-gold"
                    }`}
                  >
                    {jaAgendado ? "✅ Agendado" : vagas <= 0 ? "Lotado" : "Agendar"}
                  </button>
                </div>
              </div>
            )
          })}
          {horarios.length === 0 && (
            <div className="text-center py-10 text-[var(--white-muted)] text-sm">
              Nenhum horário disponível para este dia
            </div>
          )}
        </div>

        {meusAgendamentos.length > 0 && (
          <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5">
            <h4 className="font-bold text-sm mb-3">Meus Agendamentos</h4>
            <div className="space-y-2">
              {meusAgendamentos.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between bg-black/20 rounded-xl px-3 py-2">
                  <div>
                    <span className="text-xs font-semibold">{a.horario?.turma?.nome || "Treino"}</span>
                    <span className="text-[10px] text-[var(--white-muted)] ml-2">{a.horario?.horaInicio}</span>
                  </div>
                  <span className="text-[10px] text-[var(--white-muted)]">{new Date(a.data).toLocaleDateString("pt-BR")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

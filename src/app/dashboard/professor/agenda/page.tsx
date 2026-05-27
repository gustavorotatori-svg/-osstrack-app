"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const diaNomes = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

export default function ProfessorAgendaPage() {
  const [diaSemana, setDiaSemana] = useState(new Date().getDay())
  const [horarios, setHorarios] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [turmaNome, setTurmaNome] = useState("")
  const [horaInicio, setHoraInicio] = useState("")
  const [horaFim, setHoraFim] = useState("")
  const [maxAlunos, setMaxAlunos] = useState(30)
  const [local, setLocal] = useState("")

  useEffect(() => {
    fetch(`/api/agenda/horarios?dia=${diaSemana}`)
      .then(r => r.json())
      .then(setHorarios)
      .catch(() => {})
  }, [diaSemana])

  async function criarHorario(e: React.FormEvent) {
    e.preventDefault()
    if (!horaInicio || !horaFim) return
    const res = await fetch("/api/agenda/horarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ turmaNome: turmaNome || "Treino", professorId: "me", diaSemana, horaInicio, horaFim, maxAlunos, local }),
    })
    if (res.ok) {
      const novo = await res.json()
      setHorarios(prev => [...prev, novo])
      setShowForm(false)
      setTurmaNome(""); setHoraInicio(""); setHoraFim(""); setLocal("")
    }
  }

  async function excluir(id: string) {
    await fetch(`/api/agenda/horarios?id=${id}`, { method: "DELETE" })
    setHorarios(prev => prev.filter(h => h.id !== id))
  }

  return (
    <DashboardShell role="professor">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">📅 Minha Agenda</h3>
            <p className="text-xs text-[var(--white-muted)]">Gerencie seus horários de aula</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-gold px-4 py-2 text-sm">
            {showForm ? "✕" : "+ Horário"}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {diasSemana.map((d, i) => (
            <button key={d} onClick={() => setDiaSemana(i)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                i === diaSemana ? "bg-[var(--gold)] text-black" : "bg-[var(--dark-card)] border border-[var(--dark-border)] text-[var(--white-muted)] hover:border-[var(--gold)]"
              }`}
            >{d}</button>
          ))}
        </div>

        {showForm && (
          <form onSubmit={criarHorario} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-sm">Novo Horário — {diaNomes[diaSemana]}</h4>
            <div>
              <label className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide font-semibold">Turma</label>
              <input value={turmaNome} onChange={e => setTurmaNome(e.target.value)} className="input-premium w-full text-sm mt-1" placeholder="Ex: Jiu-Jitsu Adulto" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide font-semibold">Início</label>
                <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} className="input-premium w-full text-sm mt-1" required />
              </div>
              <div>
                <label className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide font-semibold">Fim</label>
                <input type="time" value={horaFim} onChange={e => setHoraFim(e.target.value)} className="input-premium w-full text-sm mt-1" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide font-semibold">Máx. Alunos</label>
                <input type="number" value={maxAlunos} onChange={e => setMaxAlunos(Number(e.target.value))} className="input-premium w-full text-sm mt-1" />
              </div>
              <div>
                <label className="text-[10px] text-[var(--white-muted)] uppercase tracking-wide font-semibold">Local</label>
                <input value={local} onChange={e => setLocal(e.target.value)} className="input-premium w-full text-sm mt-1" placeholder="Sala 1 / Tatame" />
              </div>
            </div>
            <button type="submit" className="btn-gold px-6 py-2.5 text-sm font-bold">Salvar Horário</button>
          </form>
        )}

        <div className="text-xs text-[var(--gold)] font-semibold tracking-wide uppercase">{diaNomes[diaSemana]}</div>

        <div className="space-y-3">
          {horarios.length > 0 ? horarios.map((h) => (
            <div key={h.id} className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">{h.turma?.nome || "Treino"}</h4>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs font-semibold text-[var(--gold)]">{h.horaInicio} - {h.horaFim}</span>
                    <span className="text-[10px] text-[var(--white-muted)]">{h.local || "Academia"}</span>
                  </div>
                  <div className="text-[10px] text-[var(--white-muted)] mt-1">
                    {h._count?.agendamentos || 0}/{h.maxAlunos} alunos
                  </div>
                </div>
                <button onClick={() => excluir(h.id)} className="text-[10px] text-red-400 hover:text-red-300 transition-colors">Excluir</button>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 text-[var(--white-muted)] text-sm">
              Nenhum horário para este dia. Clique em "+ Horário" para criar.
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}

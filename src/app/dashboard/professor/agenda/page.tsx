"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { useSession } from "next-auth/react"

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const diaNomes = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

export default function ProfessorAgendaPage() {
  const { data: session } = useSession()
  const [diaSemana, setDiaSemana] = useState(new Date().getDay())
  const [horarios, setHorarios] = useState<any[]>([])
  const [alunos, setAlunos] = useState<any[]>([])

  useEffect(() => {
    fetch(`/api/agenda/horarios?dia=${diaSemana}`).then(r => r.json()).then((data) => {
      setHorarios(data.filter((h: any) => h.professorId === session?.user?.id))
    }).catch(() => {})

    fetch("/api/professor/alunos").then(r => r.json()).then((data) => {
      setAlunos(data.alunos || data || [])
    }).catch(() => {})
  }, [diaSemana, session])

  return (
    <DashboardShell role="professor">
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 text-center">
          <div className="text-3xl mb-2">📅</div>
          <h3 className="font-bold text-lg">Minha Agenda</h3>
          <p className="text-xs text-[var(--white-muted)]">Suas aulas e alunos agendados</p>
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

        <div className="text-xs text-[var(--gold)] font-semibold tracking-wide uppercase">{diaNomes[diaSemana]}</div>

        <div className="space-y-3">
          {horarios.map((h) => (
            <div key={h.id} className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5 hover-card">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">{h.turma?.nome || "Treino"}</h4>
                  <span className="text-xs font-semibold text-[var(--gold)]">{h.horaInicio} - {h.horaFim}</span>
                  <div className="text-[10px] text-[var(--white-muted)] mt-1">
                    {h._count?.agendamentos || 0} alunos agendados · {h.maxAlunos} vagas
                  </div>
                </div>
              </div>
            </div>
          ))}
          {horarios.length === 0 && (
            <div className="text-center py-10 text-[var(--white-muted)] text-sm">
              Nenhuma aula agendada para este dia
            </div>
          )}
        </div>

        {alunos.length > 0 && (
          <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5">
            <h4 className="font-bold text-sm mb-3">Meus Alunos</h4>
            <div className="space-y-2">
              {alunos.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between bg-black/20 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{a.nome}</span>
                    <span className="text-[9px] text-[var(--white-muted)]">{a.faixa}</span>
                  </div>
                  {a.telefone && (
                    <button
                      onClick={() => window.open(`https://wa.me/55${a.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${a.nome}! Lembrete de treino hoje! Oss 🥋`)}`, "_blank")}
                      className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-semibold"
                    >
                      📱 WhatsApp
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

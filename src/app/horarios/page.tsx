import prisma from "@/lib/prisma"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Horários das Aulas — OssTrack",
  description: "Veja os horários das aulas da academia de Jiu-Jitsu. Confira o schedule completo.",
}

const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
const diaAtual = new Date().getDay()

export default async function HorariosPublicos() {
  let horarios: any[] = []
  try {
    horarios = await prisma.horarioAula.findMany({
      include: {
        turma: { select: { nome: true, cor: true, icone: true, modalidade: true, categoria: true } },
        professor: { select: { nome: true } },
      },
      orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
    })
  } catch {
    // DB unreachable at build time
  }

  const porDia = diasSemana.map((nome, i) => ({
    nome,
    index: i,
    aulas: horarios.filter((h) => h.diaSemana === i),
  }))

  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-4xl mx-auto px-5 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight gradient-gold-text">Horários das Aulas</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Confira os horários e planeje seu treino
            </p>
          </div>
          <Link href="/" className="text-xs font-semibold px-4 py-2 rounded-lg border border-[var(--border)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all" style={{ color: "var(--text-secondary)" }}>
            ← Voltar
          </Link>
        </div>

        {horarios.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🥋</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>Nenhum horário cadastrado</h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aguarde o professor configurar os horários das aulas.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {porDia.map((dia) => (
              <div key={dia.index} className={`rounded-2xl border overflow-hidden ${dia.index === diaAtual ? "border-[var(--gold)]" : "border-[var(--border)]"}`} style={{ background: "var(--bg-card)" }}>
                <div className={`px-5 py-3 flex items-center gap-3 ${dia.index === diaAtual ? "bg-[rgba(212,168,71,0.08)]" : ""}`}>
                  <h2 className={`text-sm font-extrabold uppercase tracking-wider ${dia.index === diaAtual ? "text-[var(--gold)]" : ""}`} style={{ color: dia.index !== diaAtual ? "var(--text-secondary)" : undefined }}>
                    {dia.nome}
                  </h2>
                  {dia.index === diaAtual && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--gold)] text-black">HOJE</span>
                  )}
                  <span className="text-[10px] ml-auto" style={{ color: "var(--text-muted)" }}>{dia.aulas.length} aula{dia.aulas.length !== 1 ? "s" : ""}</span>
                </div>

                {dia.aulas.length > 0 ? (
                  <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                    {dia.aulas.map((aula) => (
                      <div key={aula.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <div className="text-center min-w-[60px]">
                          <div className="text-lg font-black" style={{ color: "var(--text)" }}>{aula.horaInicio}</div>
                          <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>→ {aula.horaFim}</div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{aula.turma.icone}</span>
                            <span className="text-sm font-bold" style={{ color: "var(--text)" }}>{aula.turma.nome}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase" style={{ background: aula.turma.cor + "20", color: aula.turma.cor }}>
                              {aula.turma.modalidade}
                            </span>
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                            {aula.professor.nome} • {aula.turma.categoria} • até {aula.maxAlunos} alunos
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-4 text-xs" style={{ color: "var(--text-muted)" }}>Sem aulas neste dia</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

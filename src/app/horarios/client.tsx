"use client"

import Link from "next/link"
import { useT } from "@/lib/use-t"

export type HorarioAulaView = {
  id: string
  horaInicio: string
  horaFim: string
  maxAlunos: number
  turma: { nome: string; cor: string; icone: string; modalidade: string; categoria: string }
  professor: { nome: string }
}

export type DiaComAulas = { index: number; aulas: HorarioAulaView[] }

export function HorariosView({ porDia, diaAtual }: { porDia: DiaComAulas[]; diaAtual: number }) {
  const t = useT("pagHorarios")
  const totalAulas = porDia.reduce((acc, dia) => acc + dia.aulas.length, 0)

  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-4xl mx-auto px-5 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight gradient-gold-text">{t("titulo")}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {t("subtitulo")}
            </p>
          </div>
          <Link href="/" className="text-xs font-semibold px-4 py-2 rounded-lg border border-[var(--border)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all" style={{ color: "var(--text-secondary)" }}>
            {t("voltar")}
          </Link>
        </div>

        {totalAulas === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🥋</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>{t("nenhumTitulo")}</h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("nenhumDesc")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {porDia.map((dia) => (
              <div key={dia.index} className={`rounded-2xl border overflow-hidden ${dia.index === diaAtual ? "border-[var(--gold)]" : "border-[var(--border)]"}`} style={{ background: "var(--bg-card)" }}>
                <div className={`px-5 py-3 flex items-center gap-3 ${dia.index === diaAtual ? "bg-[rgba(212,168,71,0.08)]" : ""}`}>
                  <h2 className={`text-sm font-extrabold uppercase tracking-wider ${dia.index === diaAtual ? "text-[var(--gold)]" : ""}`} style={{ color: dia.index !== diaAtual ? "var(--text-secondary)" : undefined }}>
                    {t(`dias.${dia.index}`)}
                  </h2>
                  {dia.index === diaAtual && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--gold)] text-black">{t("hoje")}</span>
                  )}
                  <span className="text-[10px] ml-auto" style={{ color: "var(--text-muted)" }}>
                    {(dia.aulas.length === 1 ? t("aulaContador") : t("aulasContador")).replace("{n}", String(dia.aulas.length))}
                  </span>
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
                            {t("umAulaLinha")
                              .replace("{professor}", aula.professor.nome)
                              .replace("{categoria}", aula.turma.categoria)
                              .replace("{max}", String(aula.maxAlunos))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-4 text-xs" style={{ color: "var(--text-muted)" }}>{t("semAulas")}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

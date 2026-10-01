import prisma from "@/lib/prisma"
import type { Metadata } from "next"
import { HorariosView, type HorarioAulaView } from "./client"

export const metadata: Metadata = {
  title: "Horários das Aulas — OssTrack",
  description: "Veja os horários das aulas da academia de Jiu-Jitsu. Confira o schedule completo.",
  alternates: { canonical: "/horarios" },
}

export const revalidate = 300

const diaAtual = new Date().getDay()

type HorarioPublico = HorarioAulaView & { diaSemana: number }

export default async function HorariosPublicos() {
  let horarios: HorarioPublico[] = []
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

  const porDia = Array.from({ length: 7 }, (_, i) => ({
    index: i,
    aulas: horarios.filter((h) => h.diaSemana === i),
  }))

  return <HorariosView porDia={porDia} diaAtual={diaAtual} />
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const diaSemana = searchParams.get("dia")

  const where: any = { academiaId: session.user.academiaId }
  if (diaSemana) where.diaSemana = Number(diaSemana)

  const horarios = await prisma.horarioAula.findMany({
    where,
    include: {
      turma: { select: { id: true, nome: true } },
      professor: { select: { id: true, nome: true, faixa: true } },
      _count: { select: { agendamentos: true } },
    },
    orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }],
  })

  return NextResponse.json(horarios)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !["dono", "professor"].includes(session.user.role)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { turmaId, professorId, diaSemana, horaInicio, horaFim, maxAlunos, local } = await req.json()
  if (!turmaId || !professorId || diaSemana === undefined || !horaInicio || !horaFim) {
    return NextResponse.json({ error: "turmaId, professorId, diaSemana, horaInicio, horaFim obrigatórios" }, { status: 400 })
  }

  const horario = await prisma.horarioAula.create({
    data: {
      academiaId: session.user.academiaId, turmaId, professorId,
      diaSemana: Number(diaSemana), horaInicio, horaFim,
      maxAlunos: maxAlunos || 30, local,
    },
  })

  return NextResponse.json(horario, { status: 201 })
}

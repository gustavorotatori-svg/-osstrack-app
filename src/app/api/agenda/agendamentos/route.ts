import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const where: any = { academiaId: session.user.academiaId }
  if (session.user.role === "aluno") where.alunoId = session.user.id

  const agendamentos = await prisma.agendamento.findMany({
    where,
    include: {
      horario: {
        include: { turma: { select: { id: true, nome: true } }, professor: { select: { id: true, nome: true, faixa: true } } },
      },
      aluno: { select: { id: true, nome: true, faixa: true } },
    },
    orderBy: { data: "desc" },
    take: 50,
  })

  return NextResponse.json(agendamentos)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "aluno") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { horarioId, data } = await req.json()
  if (!horarioId || !data) return NextResponse.json({ error: "horarioId e data obrigatórios" }, { status: 400 })

  const horario = await prisma.horarioAula.findUnique({
    where: { id: horarioId },
    include: { _count: { select: { agendamentos: true } } },
  })
  if (!horario) return NextResponse.json({ error: "Horário não encontrado" }, { status: 404 })
  if (horario._count.agendamentos >= horario.maxAlunos) {
    return NextResponse.json({ error: "Turma lotada" }, { status: 409 })
  }

  const agendamento = await prisma.agendamento.create({
    data: { academiaId: session.user.academiaId, horarioId, alunoId: session.user.id, data: new Date(data) },
  })

  return NextResponse.json(agendamento, { status: 201 })
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const diaSemana = searchParams.get("dia")

    const where: any = { academiaId: session.user.academiaId || "" }
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
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["dono", "professor"].includes(session.user.role)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { turmaId, turmaNome, professorId, diaSemana, horaInicio, horaFim, maxAlunos, local } = await req.json()
    if (diaSemana === undefined || !horaInicio || !horaFim) {
      return NextResponse.json({ error: "diaSemana, horaInicio, horaFim obrigatórios" }, { status: 400 })
    }

    let finalProfessorId = professorId === "me" ? session.user.id : professorId
    let finalTurmaId = turmaId
    if (!finalTurmaId && turmaNome) {
      const turma = await prisma.turma.create({
        data: {
          nome: turmaNome,
          horario: `${horaInicio}-${horaFim}`,
          dias: String(diaSemana),
          maxAlunos: maxAlunos || 30,
          academiaId: session.user.academiaId || "",
          professorId: finalProfessorId || session.user.id,
        },
      })
      finalTurmaId = turma.id
    }

    const horario = await prisma.horarioAula.create({
      data: {
        academiaId: session.user.academiaId || "",
        turmaId: finalTurmaId || "default",
          professorId: finalProfessorId || session.user.id,
        diaSemana: Number(diaSemana),
        horaInicio, horaFim,
        maxAlunos: maxAlunos || 30, local,
      },
    })

    return NextResponse.json(horario, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["dono", "professor"].includes(session.user.role)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id obrigatório" }, { status: 400 })

    const horario = await prisma.horarioAula.findUnique({ where: { id } })
    if (!horario) return NextResponse.json({ error: "Horário não encontrado" }, { status: 404 })
    if (horario.academiaId !== session.user.academiaId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    await prisma.horarioAula.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}

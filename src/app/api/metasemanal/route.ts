import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

const DEFAULT_WEEKLY_GOAL = 3

export async function GET() {
  try {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "aluno") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  let meta = await prisma.progressoSemanal.findFirst({
    where: { alunoId: session.user.id, semanaInicio: startOfWeek },
  })

  if (!meta) {
    meta = await prisma.progressoSemanal.create({
      data: { alunoId: session.user.id, semanaInicio: startOfWeek, aulasAlvo: DEFAULT_WEEKLY_GOAL },
    })
  }

  return NextResponse.json({
    aulasFeitas: meta.aulasFeitas,
    aulasAlvo: meta.aulasAlvo,
    concluida: meta.aulasFeitas >= meta.aulasAlvo,
  })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST() {
  try {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "aluno") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  let meta = await prisma.progressoSemanal.findFirst({
    where: { alunoId: session.user.id, semanaInicio: startOfWeek },
  })

  if (!meta) {
    meta = await prisma.progressoSemanal.create({
      data: { alunoId: session.user.id, semanaInicio: startOfWeek, aulasAlvo: DEFAULT_WEEKLY_GOAL, aulasFeitas: 1 },
    })
  } else {
    meta = await prisma.progressoSemanal.update({
      where: { id: meta.id },
      data: {
        aulasFeitas: { increment: 1 },
        concluida: meta.aulasFeitas + 1 >= meta.aulasAlvo,
      },
    })
  }

  return NextResponse.json({
    aulasFeitas: meta.aulasFeitas,
    aulasAlvo: meta.aulasAlvo,
    concluida: meta.aulasFeitas >= meta.aulasAlvo,
  })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "aluno") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const aulasAlvo = body?.aulasAlvo
    if (!Number.isInteger(aulasAlvo) || aulasAlvo < 1 || aulasAlvo > 7) {
      return NextResponse.json({ error: "A meta deve ser de 1 a 7 aulas por semana" }, { status: 400 })
    }

    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const atual = await prisma.progressoSemanal.findFirst({
      where: { alunoId: session.user.id, semanaInicio: startOfWeek },
      select: { id: true, aulasFeitas: true },
    })
    const aulasFeitas = atual?.aulasFeitas || 0
    const meta = atual
      ? await prisma.progressoSemanal.update({
          where: { id: atual.id },
          data: { aulasAlvo, concluida: aulasFeitas >= aulasAlvo },
        })
      : await prisma.progressoSemanal.create({
          data: {
            alunoId: session.user.id,
            semanaInicio: startOfWeek,
            aulasAlvo,
            aulasFeitas,
            concluida: aulasFeitas >= aulasAlvo,
          },
        })

    return NextResponse.json({
      aulasFeitas: meta.aulasFeitas,
      aulasAlvo: meta.aulasAlvo,
      concluida: meta.aulasFeitas >= meta.aulasAlvo,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

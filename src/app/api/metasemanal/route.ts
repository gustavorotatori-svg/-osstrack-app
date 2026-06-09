import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET() {
  try {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "aluno") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  let meta = await prisma.metaSemanal.findFirst({
    where: { alunoId: session.user.id, semanaInicio: startOfWeek },
  })

  if (!meta) {
    meta = await prisma.metaSemanal.create({
      data: { alunoId: session.user.id, semanaInicio: startOfWeek, aulasAlvo: 5 },
    })
  }

  return NextResponse.json({
    aulasFeitas: meta.aulasFeitas,
    aulasAlvo: meta.aulasAlvo,
    concluida: meta.concluida,
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

  let meta = await prisma.metaSemanal.findFirst({
    where: { alunoId: session.user.id, semanaInicio: startOfWeek },
  })

  if (!meta) {
    meta = await prisma.metaSemanal.create({
      data: { alunoId: session.user.id, semanaInicio: startOfWeek, aulasAlvo: 5, aulasFeitas: 1 },
    })
  } else {
    meta = await prisma.metaSemanal.update({
      where: { id: meta.id },
      data: { aulasFeitas: { increment: 1 } },
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
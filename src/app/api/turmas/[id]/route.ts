import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || !["dono", "professor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const turma = await prisma.turma.findUnique({ where: { id } })
  if (!turma) return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 })

  if (session.user.role === "professor" && turma.professorId !== session.user.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  await prisma.turma.delete({ where: { id } })
  return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || !["dono", "professor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const data = await request.json()

  const turma = await prisma.turma.findUnique({ where: { id } })
  if (!turma) return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 })

  if (session.user.role === "professor" && turma.professorId !== session.user.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const updated = await prisma.turma.update({
    where: { id },
    data: {
      ...(data.nome && { nome: data.nome }),
      ...(data.descricao !== undefined && { descricao: data.descricao }),
      ...(data.cor && { cor: data.cor }),
      ...(data.icone && { icone: data.icone }),
      ...(data.categoria && { categoria: data.categoria }),
      ...(data.modalidade && { modalidade: data.modalidade }),
      ...(data.maxAlunos && { maxAlunos: data.maxAlunos }),
    },
  })

  return NextResponse.json(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

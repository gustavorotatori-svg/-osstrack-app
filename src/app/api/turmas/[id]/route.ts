import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { turmaUpdateSchema } from "@/lib/validation"

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
  const parsed = turmaUpdateSchema.safeParse(data)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos" }, { status: 400 })
  }
  const cleanData = parsed.data
  Object.keys(cleanData).forEach((key) => (cleanData as any)[key] === undefined && delete (cleanData as any)[key])

  const turma = await prisma.turma.findUnique({ where: { id } })
  if (!turma) return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 })

  if (session.user.role === "professor" && turma.professorId !== session.user.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const updated = await prisma.turma.update({
    where: { id },
    data: cleanData,
  })

  return NextResponse.json(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

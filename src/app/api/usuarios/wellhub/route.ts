import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["dono", "professor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { alunoId, wellhubId } = await request.json()
    if (!alunoId || !wellhubId) {
      return NextResponse.json({ error: "alunoId e wellhubId obrigatórios" }, { status: 400 })
    }

    const aluno = await prisma.usuario.findUnique({
      where: { id: alunoId },
      select: { id: true, academiaId: true, wellhubId: true },
    })

    if (!aluno || aluno.academiaId !== session.user.academiaId) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
    }

    const existing = await prisma.usuario.findFirst({
      where: { wellhubId, academiaId: session.user.academiaId, id: { not: alunoId } },
    })
    if (existing) {
      return NextResponse.json({ error: "Este Wellhub ID já está associado a outro aluno" }, { status: 409 })
    }

    await prisma.usuario.update({
      where: { id: alunoId },
      data: { wellhubId },
    })

    return NextResponse.json({ success: true, alunoId, wellhubId })
  } catch (error) {
    return handleApiError(error)
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const turma = await prisma.turma.findUnique({
    where: { id },
    include: {
      alunos: { include: { aluno: { select: { id: true, nome: true, faixa: true, grau: true } } } },
    },
  })

  if (!turma || turma.academiaId !== session.user.academiaId) {
    return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 })
  }

  const alunosNaTurma = turma.alunos.map((ta) => ta.aluno)

  const todosAlunos = await prisma.usuario.findMany({
    where: { academiaId: session.user.academiaId, role: "aluno" },
    select: { id: true, nome: true, faixa: true, grau: true },
    orderBy: { nome: "asc" },
  })

  return NextResponse.json({ alunosNaTurma, todosAlunos })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["dono", "professor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const { alunoId } = await req.json()
    if (!alunoId) return NextResponse.json({ error: "alunoId obrigatório" }, { status: 400 })

    const turma = await prisma.turma.findUnique({ where: { id } })
    if (!turma || turma.academiaId !== session.user.academiaId) {
      return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 })
    }

    const existing = await prisma.turmaAluno.findUnique({
      where: { turmaId_alunoId: { turmaId: id, alunoId } },
    })
    if (existing) {
      return NextResponse.json({ error: "Aluno já está nesta turma" }, { status: 409 })
    }

    await prisma.turmaAluno.create({ data: { turmaId: id, alunoId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["dono", "professor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const { alunoId } = await req.json()
    if (!alunoId) return NextResponse.json({ error: "alunoId obrigatório" }, { status: 400 })

    const turma = await prisma.turma.findUnique({ where: { id } })
    if (!turma || turma.academiaId !== session.user.academiaId) {
      return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 })
    }

    await prisma.turmaAluno.deleteMany({
      where: { turmaId: id, alunoId },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}

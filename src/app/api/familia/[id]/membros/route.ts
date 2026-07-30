import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { familiaMembroSchema } from "@/lib/validation"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const familia = await prisma.familia.findUnique({
      where: { id },
      include: {
        membros: {
          include: {
            aluno: { select: { id: true, nome: true, faixa: true, grau: true } },
          },
        },
      },
    })

    if (!familia || familia.academiaId !== session.user.academiaId) {
      return NextResponse.json({ error: "Família não encontrada" }, { status: 404 })
    }

    const membrosNaFamilia = familia.membros.map((m) => m.aluno)

    const todosAlunos = await prisma.usuario.findMany({
      where: { academiaId: session.user.academiaId, role: "aluno" },
      select: { id: true, nome: true, faixa: true, grau: true },
      orderBy: { nome: "asc" },
    })

    return NextResponse.json({ membrosNaFamilia, todosAlunos })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "dono") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = familiaMembroSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "alunoId obrigatório" }, { status: 400 })
    }

    const familia = await prisma.familia.findUnique({ where: { id } })
    if (!familia || familia.academiaId !== session.user.academiaId) {
      return NextResponse.json({ error: "Família não encontrada" }, { status: 404 })
    }

    const existing = await prisma.familiaMembro.findUnique({
      where: { familiaId_alunoId: { familiaId: id, alunoId: parsed.data.alunoId } },
    })
    if (existing) {
      return NextResponse.json({ error: "Aluno já está nesta família" }, { status: 409 })
    }

    await prisma.familiaMembro.create({ data: { familiaId: id, alunoId: parsed.data.alunoId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { turmaSchema } from "@/lib/validation"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const where: any = { academiaId: session.user.academiaId }

  const turmas = await prisma.turma.findMany({
    where,
    include: { _count: { select: { alunos: true, horarios: true } } },
    orderBy: { nome: "asc" },
  })

  return NextResponse.json(turmas)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
  if (!session || !["dono", "professor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = turmaSchema.pick({ nome: true, descricao: true, cor: true, icone: true, categoria: true, modalidade: true, maxAlunos: true }).safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Nome obrigatório" }, { status: 400 })
  }
  const { nome, descricao, cor, icone, categoria, modalidade, maxAlunos } = parsed.data

  const turma = await prisma.turma.create({
    data: {
      nome,
      descricao: descricao || null,
      cor: cor || "#C9A84C",
      icone: icone || "🥋",
      categoria: categoria || "adulto",
      modalidade: modalidade || "kimono",
      maxAlunos: maxAlunos || 30,
      horario: "",
      dias: "",
      academiaId: session.user.academiaId!,
      professorId: session.user.id,
    },
  })

  return NextResponse.json(turma)
  } catch (error) {
    return handleApiError(error)
  }
}

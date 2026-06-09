import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const where: any = { academiaId: session.user.academiaId }

  if (session.user.role === "professor") {
    where.professorId = session.user.id
  }

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

  const { nome, descricao, cor, icone, categoria, maxAlunos } = await request.json()
  if (!nome) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 })

  const turma = await prisma.turma.create({
    data: {
      nome,
      descricao: descricao || null,
      cor: cor || "#C9A84C",
      icone: icone || "🥋",
      categoria: categoria || "adulto",
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

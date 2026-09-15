import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "dono") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    const academiaId = session.user.academiaId
    if (!academiaId) {
      return NextResponse.json({ error: "Academia não encontrada" }, { status: 400 })
    }

    const [temTurma, temProfessor, temAluno, temPresenca] = await Promise.all([
      prisma.turma.count({ where: { academiaId } }),
      prisma.usuario.count({
        where: { academiaId, role: "professor", NOT: { id: session.user.id } },
      }),
      prisma.usuario.count({ where: { academiaId, role: "aluno" } }),
      prisma.presenca.count({ where: { aluno: { academiaId } } }),
    ])

    return NextResponse.json({
      steps: {
        turma: temTurma > 0,
        professor: temProfessor > 0,
        aluno: temAluno > 0,
        presenca: temPresenca > 0,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 },
    )
  }
}
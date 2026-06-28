import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["dono", "professor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const professores = await prisma.usuario.findMany({
      where: { academiaId: session.user.academiaId, role: "professor" },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        faixa: true,
        grau: true,
        avatar: true,
        dataInicio: true,
        _count: { select: { alunos: true, presencas: true, turmas: true } },
      },
      orderBy: { nome: "asc" },
    })

    return NextResponse.json({
      professores: professores.map((p) => ({
        id: p.id,
        nome: p.nome,
        email: p.email,
        telefone: p.telefone,
        faixa: p.faixa,
        grau: p.grau,
        avatar: p.avatar,
        dataInicio: p.dataInicio?.toISOString() || null,
        totalAlunos: p._count.alunos,
        totalPresencas: p._count.presencas,
        totalTurmas: p._count.turmas,
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

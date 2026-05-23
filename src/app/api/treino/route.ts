import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const duasHorasAtras = new Date(Date.now() - 2 * 60 * 60 * 1000)

  const presencasRecentes = await prisma.presenca.findMany({
    where: {
      data: { gte: duasHorasAtras },
      status: "confirmed",
      aluno: { academiaId: session.user.academiaId },
    },
    include: { aluno: { select: { id: true, nome: true, faixa: true } } },
    distinct: ["alunoId"],
    orderBy: { data: "desc" },
    take: 10,
  })

  const treinando = presencasRecentes.map((p) => ({
    nome: p.aluno.nome,
    faixa: p.aluno.faixa,
  }))

  return NextResponse.json({ treinando })
}

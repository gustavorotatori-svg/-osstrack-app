import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.academiaId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const now = new Date()
  const mes = now.getMonth() + 1
  const ano = now.getFullYear()

  const mestre = await prisma.mestreDoMes.findFirst({
    where: { academiaId: session.user.academiaId, mes, ano },
    include: { aluno: { select: { nome: true, faixa: true, avatar: true } } },
  })

  if (!mestre) {
    return NextResponse.json({ mestre: null })
  }

  return NextResponse.json({
    mestre: {
      nome: mestre.aluno.nome,
      faixa: mestre.aluno.faixa,
      avatar: mestre.aluno.avatar,
      totalAulas: mestre.totalAulas,
      mes: mestre.mes,
      ano: mestre.ano,
    },
  })
}

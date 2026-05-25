import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const graduacoes = await prisma.graduacao.findMany({
    where: { academiaId: session.user.academiaId },
    orderBy: { aulasProxFx: "asc" },
  })

  return NextResponse.json(graduacoes)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const { faixa, categoria, graus, aulasPorGrau, aulasProxFx, aulasMinimasAno, dataProva, regraTroca } = body

  if (!faixa || graus === undefined || aulasPorGrau === undefined) {
    return NextResponse.json({ error: "faixa, graus e aulasPorGrau são obrigatórios" }, { status: 400 })
  }

  const graduacao = await prisma.graduacao.create({
    data: {
      academiaId: session.user.academiaId,
      faixa,
      categoria: categoria || "adulto",
      graus,
      aulasPorGrau,
      aulasProxFx: aulasProxFx || null,
      aulasMinimasAno: aulasMinimasAno || null,
      dataProva: dataProva ? new Date(dataProva) : null,
      regraTroca: regraTroca || "graus",
    },
  })

  return NextResponse.json(graduacao, { status: 201 })
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const { id, faixa, graus, aulasPorGrau, aulasProxFx, aulasMinimasAno, dataProva, regraTroca } = body

  if (!id) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 })

  const graduacao = await prisma.graduacao.update({
    where: { id },
    data: {
      ...(faixa !== undefined && { faixa }),
      ...(graus !== undefined && { graus }),
      ...(aulasPorGrau !== undefined && { aulasPorGrau }),
      ...(aulasProxFx !== undefined && { aulasProxFx }),
      ...(aulasMinimasAno !== undefined && { aulasMinimasAno }),
      ...(dataProva !== undefined && { dataProva: dataProva ? new Date(dataProva) : null }),
      ...(regraTroca !== undefined && { regraTroca }),
    },
  })

  return NextResponse.json(graduacao)
}

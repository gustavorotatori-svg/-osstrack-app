import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono" || !session.user.academiaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const planos = await prisma.planoMensalidade.findMany({
    where: { academiaId: session.user.academiaId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(planos)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono" || !session.user.academiaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { nome, valor, descricao, periodo } = body

  if (!nome || valor == null) {
    return NextResponse.json({ error: "Nome e valor são obrigatórios" }, { status: 400 })
  }

  const plano = await prisma.planoMensalidade.create({
    data: {
      academiaId: session.user.academiaId,
      nome,
      valor: Math.round(valor * 100),
      descricao,
      periodo: periodo || "mensal",
    },
  })

  return NextResponse.json(plano)
}

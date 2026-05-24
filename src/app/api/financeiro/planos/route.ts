import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const planos = await prisma.planoMensalidade.findMany({
    where: { academiaId: session.user.academiaId },
    orderBy: { valor: "asc" },
  })

  return NextResponse.json(planos)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { nome, valor, descricao, recorrencia } = await req.json()
  if (!nome || !valor) return NextResponse.json({ error: "nome e valor são obrigatórios" }, { status: 400 })

  const plano = await prisma.planoMensalidade.create({
    data: { academiaId: session.user.academiaId, nome, valor: Number(valor), descricao, recorrencia: recorrencia || "mensal" },
  })

  return NextResponse.json(plano, { status: 201 })
}

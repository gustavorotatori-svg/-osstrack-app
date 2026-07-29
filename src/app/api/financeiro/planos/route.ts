import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { planoCreateSchema } from "@/lib/validation"

export async function GET() {
  try {
  const session = await getServerSession(authOptions)
  if (!session || !["dono", "professor"].includes(session.user.role) || !session.user.academiaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const planos = await prisma.planoMensalidade.findMany({
    where: { academiaId: session.user.academiaId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(planos)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: Request) {
  try {
  const session = await getServerSession(authOptions)
  if (!session || !["dono", "professor"].includes(session.user.role) || !session.user.academiaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = planoCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos" }, { status: 400 })
  }
  const { nome, valor, taxaMatricula, descricao, periodo } = parsed.data

  const plano = await prisma.planoMensalidade.create({
    data: {
      academiaId: session.user.academiaId,
      nome,
      valor: Math.round(valor * 100),
      taxaMatricula: Math.round(taxaMatricula * 100),
      descricao,
      periodo,
    },
  })

  return NextResponse.json(plano)
  } catch (error) {
    return handleApiError(error)
  }

}
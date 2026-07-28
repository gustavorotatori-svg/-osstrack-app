import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { despesaSchema } from "@/lib/validation"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["dono", "professor"].includes(session.user.role) || !session.user.academiaId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const despesas = await prisma.despesa.findMany({
      where: { academiaId: session.user.academiaId },
      orderBy: { dataVencimento: "desc" },
    })

    return NextResponse.json(despesas)
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
    const parsed = despesaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos" }, { status: 400 })
    }
    const { descricao, valor, categoria, dataVencimento, observacao } = parsed.data

    const despesa = await prisma.despesa.create({
      data: {
        academiaId: session.user.academiaId,
        descricao,
        valor: Math.round(Number(valor)),
        categoria: categoria || "outras",
        dataVencimento: new Date(dataVencimento),
        observacao,
      },
    })

    return NextResponse.json(despesa)
  } catch (error) {
    return handleApiError(error)
  }
}

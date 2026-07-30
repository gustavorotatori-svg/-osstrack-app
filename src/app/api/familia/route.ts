import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { familiaSchema } from "@/lib/validation"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const familias = await prisma.familia.findMany({
      where: { academiaId: session.user.academiaId },
      include: {
        _count: { select: { membros: true } },
      },
      orderBy: { nome: "asc" },
    })

    return NextResponse.json(familias)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "dono") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = familiaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Nome obrigatório" }, { status: 400 })
    }

    const familia = await prisma.familia.create({
      data: {
        nome: parsed.data.nome,
        desconto: parsed.data.desconto,
        academiaId: session.user.academiaId!,
      },
    })

    return NextResponse.json(familia)
  } catch (error) {
    return handleApiError(error)
  }
}

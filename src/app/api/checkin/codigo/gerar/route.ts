import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { checkinCodigoGerarSchema } from "@/lib/validation"

function gerarCodigo(): string {
  return String(Math.floor(1000 + Math.random() * 9000))
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.academiaId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    if (session.user.role !== "dono" && session.user.role !== "professor") {
      return NextResponse.json({ error: "Apenas dono ou professor" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = checkinCodigoGerarSchema.safeParse(body)
    const turma = parsed.success ? parsed.data.turma : undefined
    const codigo = gerarCodigo()

    await prisma.checkinCodigo.create({
      data: {
        academiaId: session.user.academiaId,
        criadoPor: session.user.id,
        codigo,
        turma: turma || null,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    })

    return NextResponse.json({ codigo, expiresIn: 300 })
  } catch (error) {
    return handleApiError(error)
  }
}
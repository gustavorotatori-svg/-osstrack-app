import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { academiaUpdateSchema } from "@/lib/validation"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const academia = await prisma.academia.findUnique({
      where: { id: session.user.academiaId },
    })

    if (!academia) return NextResponse.json({ error: "Academia não encontrada" }, { status: 404 })

    return NextResponse.json(academia)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "dono") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = academiaUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos" }, { status: 400 })
    }

    const data = parsed.data as Record<string, unknown>
    Object.keys(data).forEach((key) => data[key] === undefined && delete data[key])

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nenhum dado válido para atualizar" }, { status: 400 })
    }

    const academia = await prisma.academia.update({
      where: { id: session.user.academiaId },
      data,
    })

    return NextResponse.json(academia)
  } catch (error) {
    return handleApiError(error)
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const notificacoes = await prisma.notificacao.findMany({
      where: { usuarioId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json(notificacoes)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { id, todas } = await request.json()

    if (todas) {
      await prisma.notificacao.updateMany({
        where: { usuarioId: session.user.id, lida: false },
        data: { lida: true },
      })
    } else if (id) {
      await prisma.notificacao.update({
        where: { id, usuarioId: session.user.id },
        data: { lida: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { sendPushToUser } from "@/lib/webpush"
import { handleApiError } from "@/lib/api-error"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { usuarioId, titulo, descricao, tipo, link } = await req.json()

    if (!usuarioId || !titulo || !descricao) {
      return NextResponse.json({ error: "usuarioId, titulo e descricao são obrigatórios" }, { status: 400 })
    }

    // Must notify only users from the same academy
    const targetUser = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { academiaId: true },
    })
    if (!targetUser || targetUser.academiaId !== session.user.academiaId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const notificacao = await prisma.notificacao.create({
      data: {
        usuarioId,
        tipo: tipo || "sistema",
        titulo,
        descricao,
        link: link || null,
      },
    })

    const pushResult = await sendPushToUser(usuarioId, {
      title: titulo,
      body: descricao,
      url: link || undefined,
    })

    return NextResponse.json({ ok: true, notificacao, push: pushResult })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await prisma.pushSubscription.deleteMany({
      where: { usuarioId: session.user.id },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}

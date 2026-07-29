import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { sendPushToUser } from "@/lib/webpush"
import { handleApiError } from "@/lib/api-error"
import { notificarSchema } from "@/lib/validation"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = notificarSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos" }, { status: 400 })
    }
    const { usuarioId, titulo, descricao, tipo, link } = parsed.data

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
        descricao: descricao || "",
        link: link || null,
      },
    })

    const pushResult = await sendPushToUser(usuarioId, {
      title: titulo,
      body: descricao || "",
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

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { endpoint, p256dh, auth, userAgent } = await req.json()

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: "Dados de inscrição incompletos" }, { status: 400 })
    }

    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    })

    if (existing) {
      await prisma.pushSubscription.update({
        where: { id: existing.id },
        data: { p256dh, auth, userAgent: userAgent || null },
      })
      return NextResponse.json({ ok: true, updated: true })
    }

    await prisma.pushSubscription.create({
      data: {
        usuarioId: session.user.id,
        endpoint,
        p256dh,
        auth,
        userAgent: userAgent || null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { endpoint } = await req.json()
    if (!endpoint) {
      return NextResponse.json({ error: "endpoint é obrigatório" }, { status: 400 })
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint, usuarioId: session.user.id },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}

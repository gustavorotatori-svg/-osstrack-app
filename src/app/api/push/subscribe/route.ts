import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import z from "zod"

const pushSubscribeSchema = z.object({
  endpoint: z.string().min(1).max(500),
  p256dh: z.string().min(1).max(500),
  auth: z.string().min(1).max(500),
  userAgent: z.string().max(500).optional(),
})

const pushUnsubscribeSchema = z.object({
  endpoint: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = pushSubscribeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados de inscrição incompletos" }, { status: 400 })
    }
    const { endpoint, p256dh, auth, userAgent } = parsed.data

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

    const body = await req.json()
    const parsed = pushUnsubscribeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "endpoint é obrigatório" }, { status: 400 })
    }
    const { endpoint } = parsed.data

    await prisma.pushSubscription.deleteMany({
      where: { endpoint, usuarioId: session.user.id },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}

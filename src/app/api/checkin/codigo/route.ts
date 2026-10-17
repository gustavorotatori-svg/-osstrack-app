import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { checkinCodigoSchema } from "@/lib/validation"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.academiaId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const ip = getClientIp(req)
    const rl = await checkRateLimit(`checkin:${session.user.id}:${ip}`, "checkin-codigo")
    if (!rl.allowed) {
      return NextResponse.json({ error: "Muitas tentativas" }, { status: 429 })
    }

    const body = await req.json()
    const parsed = checkinCodigoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 })
    }
    const { codigo } = parsed.data

    const checkin = await prisma.presenca.findFirst({
      where: {
        alunoId: session.user.id,
        data: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        status: "pendente",
      },
    })

    if (checkin) {
      return NextResponse.json({ error: "Você já tem um check-in pendente hoje" }, { status: 400 })
    }

    const codigoValido = await prisma.checkinCodigo.findFirst({
      where: {
        academiaId: session.user.academiaId,
        codigo,
        expiresAt: { gte: new Date() },
        usado: false,
      },
    })

    if (!codigoValido) {
      return NextResponse.json({ error: "Código inválido ou expirado" }, { status: 400 })
    }

    const consumed = await prisma.checkinCodigo.updateMany({
      where: { id: codigoValido.id, usado: false },
      data: { usado: true, usadoPor: session.user.id },
    })

    if (consumed.count === 0) {
      return NextResponse.json({ error: "Código inválido ou expirado" }, { status: 400 })
    }

    const presenca = await prisma.presenca.create({
      data: {
        alunoId: session.user.id,
        data: new Date(),
        horario: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        status: "confirmed",
        turma: codigoValido.turma || null,
      },
    })

    return NextResponse.json({ ok: true, presenca })
  } catch (error) {
    return handleApiError(error)
  }
}
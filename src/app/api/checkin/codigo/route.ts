import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.academiaId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { codigo } = await req.json()
    if (!codigo || codigo.length !== 4) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 })
    }

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

    const hoje = new Date().toISOString().split("T")[0]
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

    await prisma.checkinCodigo.update({
      where: { id: codigoValido.id },
      data: { usado: true, usadoPor: session.user.id },
    })

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
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "professor") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { presencaId, status } = await request.json()

  if (!presencaId || !["confirmed", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }

  const presenca = await prisma.presenca.findUnique({
    where: { id: presencaId },
    include: { aluno: true },
  })

  if (!presenca) return NextResponse.json({ error: "Presença não encontrada" }, { status: 404 })

  await prisma.presenca.update({
    where: { id: presencaId },
    data: { status, confirmadoPor: session.user.id },
  })

  if (status === "confirmed") {
    await prisma.notificacao.create({
      data: {
        usuarioId: presenca.alunoId,
        tipo: "presenca",
        titulo: "Presença confirmada!",
        descricao: `Sua presença de ${presenca.horario} foi confirmada por ${session.user.name}`,
        link: "/dashboard/aluno",
      },
    })
  }

  return NextResponse.json({ success: true })
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "aluno") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { latitude, longitude } = await request.json()

  const now = new Date()
  const horario = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

  const presenca = await prisma.presenca.create({
    data: {
      alunoId: session.user.id,
      data: now,
      horario,
      status: "pendente",
      observacao: latitude && longitude ? `${latitude},${longitude}` : null,
    },
  })

  return NextResponse.json({ success: true, id: presenca.id })
}

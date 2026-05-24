import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const academia = await prisma.academia.findUnique({
    where: { id: session.user.academiaId },
  })

  if (!academia) return NextResponse.json({ error: "Academia não encontrada" }, { status: 404 })

  return NextResponse.json(academia)
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const { nome, whatsapp, pixKey, raio, horarioInicio, horarioFim } = body

  const academia = await prisma.academia.update({
    where: { id: session.user.academiaId },
    data: {
      ...(nome !== undefined && { nome }),
      ...(whatsapp !== undefined && { whatsapp }),
      ...(pixKey !== undefined && { pixKey }),
      ...(raio !== undefined && { raio }),
    },
  })

  return NextResponse.json(academia)
}

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params

  const convite = await prisma.convite.findUnique({
    where: { codigo },
    include: { academia: { select: { id: true, nome: true, cidade: true, estado: true } } },
  })

  if (!convite) return NextResponse.json({ error: "Convite inválido" }, { status: 404 })
  if (convite.usado) return NextResponse.json({ error: "Convite já utilizado" }, { status: 410 })
  if (convite.expiresAt && convite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Convite expirado" }, { status: 410 })
  }

  return NextResponse.json({
    tipo: convite.tipo,
    academiaId: convite.academiaId,
    academia: convite.academia,
  })
}

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const academiaId = searchParams.get("academiaId")
  const q = searchParams.get("q")

  if (!academiaId) return NextResponse.json([])

  const where: any = { academiaId, role: "professor" }
  if (q && q.length >= 2) where.nome = { contains: q, mode: "insensitive" }

  const professores = await prisma.usuario.findMany({
    where,
    select: { id: true, nome: true },
    take: 10,
    orderBy: { nome: "asc" },
  })

  return NextResponse.json(professores)
}

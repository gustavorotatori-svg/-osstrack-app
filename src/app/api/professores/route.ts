import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(request.url)
  const academiaId = searchParams.get("academiaId") || session?.user?.academiaId
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

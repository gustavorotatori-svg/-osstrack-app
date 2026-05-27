import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") || ""

  if (q.length < 2) return NextResponse.json([])

  const academias = await prisma.academia.findMany({
    where: {
      OR: [
        { nome: { contains: q, mode: "insensitive" } },
        { cidade: { contains: q, mode: "insensitive" } },
        { estado: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, nome: true, cidade: true, estado: true },
    take: 10,
  })

  return NextResponse.json(academias)
}

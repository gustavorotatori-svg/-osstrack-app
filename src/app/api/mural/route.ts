import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const postagens = await prisma.postagemMural.findMany({
    where: { academiaId: session.user.academiaId },
    include: {
      aluno: { select: { id: true, nome: true, faixa: true, grau: true } },
      comentarios: {
        include: { usuario: { select: { id: true, nome: true, faixa: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json(postagens)
}

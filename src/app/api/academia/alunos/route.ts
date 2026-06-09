import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.academiaId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const alunos = await prisma.usuario.findMany({
      where: { academiaId: session.user.academiaId, role: "aluno" },
      select: { id: true, nome: true, faixa: true, grau: true },
      orderBy: { nome: "asc" },
    })

    return NextResponse.json(alunos)
  } catch (error) {
    return handleApiError(error)
  }
}

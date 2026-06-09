import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { id: postagemId } = await params
    if (!postagemId) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

    const existing = await prisma.curtidaMural.findUnique({
      where: { postagemId_usuarioId: { postagemId, usuarioId: session.user.id } },
    })

    if (existing) {
      await prisma.curtidaMural.delete({ where: { id: existing.id } })
      await prisma.postagemMural.update({ where: { id: postagemId }, data: { curtidas: { decrement: 1 } } })
    } else {
      await prisma.curtidaMural.create({ data: { postagemId, usuarioId: session.user.id } })
      await prisma.postagemMural.update({ where: { id: postagemId }, data: { curtidas: { increment: 1 } } })
    }

    const postagem = await prisma.postagemMural.findUnique({
      where: { id: postagemId },
      select: { curtidas: true },
    })

    return NextResponse.json({ curtidas: postagem?.curtidas || 0, liked: !existing })
  } catch (error) {
    return handleApiError(error)
  }

}
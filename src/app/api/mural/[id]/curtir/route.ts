import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { notificarUsuario } from "@/lib/notificar"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { id: postagemId } = await params
    if (!postagemId) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

    // Check post belongs to user's academy
    const post = await prisma.postagemMural.findUnique({
      where: { id: postagemId },
      include: { aluno: { select: { id: true, academiaId: true, nome: true } } },
    })
    if (!post || post.aluno.academiaId !== session.user.academiaId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const existing = await prisma.curtidaMural.findUnique({
      where: { postagemId_usuarioId: { postagemId, usuarioId: session.user.id } },
    })

    if (existing) {
      await prisma.curtidaMural.delete({ where: { id: existing.id } })
      await prisma.postagemMural.update({ where: { id: postagemId }, data: { curtidas: { decrement: 1 } } })
    } else {
      await prisma.curtidaMural.create({ data: { postagemId, usuarioId: session.user.id } })
      await prisma.postagemMural.update({ where: { id: postagemId }, data: { curtidas: { increment: 1 } } })
      if (post.aluno.id !== session.user.id) {
        await notificarUsuario({
          usuarioId: post.aluno.id,
          tipo: "curtida",
          titulo: "Curtida no mural",
          descricao: `${session.user.name} curtiu sua publicacao`,
          link: "/dashboard/aluno/mural",
        }).catch(() => {})
      }
    }

    return NextResponse.json({ curtidas: (post.curtidas ?? 0) + (existing ? -1 : 1), liked: !existing })
  } catch (error) {
    return handleApiError(error)
  }

}
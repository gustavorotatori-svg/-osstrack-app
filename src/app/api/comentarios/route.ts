import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const postagemId = searchParams.get("postagemId")

    if (!postagemId) return NextResponse.json({ error: "postagemId é obrigatório" }, { status: 400 })

    // Check post belongs to user's academy
    const postagem = await prisma.postagemMural.findUnique({
      where: { id: postagemId },
      include: { aluno: { select: { academiaId: true } } },
    })
    if (!postagem || postagem.aluno.academiaId !== session.user.academiaId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const comentarios = await prisma.comentarioMural.findMany({
      where: { postagemId },
      include: { usuario: { select: { id: true, nome: true, faixa: true } } },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(comentarios)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { postagemId, conteudo } = await request.json()

    if (!postagemId || !conteudo?.trim()) {
      return NextResponse.json({ error: "postagemId e conteudo são obrigatórios" }, { status: 400 })
    }

    // Check post belongs to user's academy
    const postagem = await prisma.postagemMural.findUnique({
      where: { id: postagemId },
      include: { aluno: { select: { academiaId: true } } },
    })
    if (!postagem || postagem.aluno.academiaId !== session.user.academiaId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const comentario = await prisma.comentarioMural.create({
      data: { postagemId, usuarioId: session.user.id, conteudo: conteudo.trim() },
      include: { usuario: { select: { id: true, nome: true, faixa: true } } },
    })

    if (postagem.alunoId !== session.user.id) {
      await prisma.notificacao.create({
        data: {
          usuarioId: postagem.alunoId,
          tipo: "comentario",
          titulo: "Novo comentário",
          descricao: `${session.user.name} comentou na sua publicação`,
          link: "/dashboard/aluno/mural",
        },
      })
    }

    return NextResponse.json(comentario)
  } catch (error) {
    return handleApiError(error)
  }
}

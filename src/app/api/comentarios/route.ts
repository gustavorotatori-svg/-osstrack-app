import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { notificarUsuario } from "@/lib/notificar"
import { comentarioSchema } from "@/lib/validation"

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

    const body = await request.json()
    const parsed = comentarioSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos" }, { status: 400 })
    }
    const { postagemId, conteudo } = parsed.data

    if (!conteudo?.trim()) {
      return NextResponse.json({ error: "Conteúdo obrigatório" }, { status: 400 })
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
      await notificarUsuario({
        usuarioId: postagem.alunoId,
        tipo: "comentario",
        titulo: "Novo comentario",
        descricao: `${session.user.name} comentou na sua publicacao`,
        link: "/dashboard/aluno/mural",
      }).catch(() => {})
    }

    return NextResponse.json(comentario)
  } catch (error) {
    return handleApiError(error)
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { muralPostSchema } from "@/lib/validation"

export async function GET() {
  try {
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
        curtidasList: {
          where: { usuarioId: session.user.id },
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const enriched = postagens.map((p) => ({
      ...p,
      curtidas: p.curtidas,
      curtido: p.curtidasList.length > 0,
      curtidasList: undefined,
    }))

    return NextResponse.json(enriched)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["aluno", "professor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = muralPostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos" }, { status: 400 })
    }
    const { tipo, conteudo } = parsed.data

    const postagem = await prisma.postagemMural.create({
      data: {
        academiaId: session.user.academiaId,
        alunoId: session.user.id,
        tipo,
        conteudo,
      },
    })

    return NextResponse.json(postagem, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
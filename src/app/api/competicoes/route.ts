import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.academiaId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const competicoes = await prisma.competicao.findMany({
      where: { academiaId: session.user.academiaId },
      include: {
        participacoes: {
          include: { aluno: { select: { id: true, nome: true, faixa: true, avatar: true } } },
        },
      },
      orderBy: { data: "desc" },
    })

    return NextResponse.json(competicoes)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.academiaId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    if (session.user.role === "aluno") return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

    const body = await req.json()
    const { nome, data, local, faixa, categoria, observacoes, participacoes } = body

    if (!nome || !data) {
      return NextResponse.json({ error: "Nome e data são obrigatórios" }, { status: 400 })
    }

    const competicao = await prisma.competicao.create({
      data: {
        academiaId: session.user.academiaId,
        nome,
        data: new Date(data),
        local: local || null,
        faixa: faixa || null,
        categoria: categoria || null,
        observacoes: observacoes || null,
        participacoes: participacoes?.length
          ? {
              create: participacoes.map((p: { alunoId: string; posicao?: string; categoria?: string; observacao?: string }) => ({
                alunoId: p.alunoId,
                posicao: p.posicao || null,
                categoria: p.categoria || null,
                observacao: p.observacao || null,
              })),
            }
          : undefined,
      },
      include: {
        participacoes: {
          include: { aluno: { select: { id: true, nome: true, faixa: true, avatar: true } } },
        },
      },
    })

    return NextResponse.json(competicao)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.academiaId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    if (session.user.role === "aluno") return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 })

    await prisma.participacaoCompeticao.deleteMany({ where: { competicaoId: id } })
    await prisma.competicao.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}

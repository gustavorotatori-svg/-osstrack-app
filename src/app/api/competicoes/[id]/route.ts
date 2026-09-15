import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.academiaId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    if (session.user.role === "aluno") return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

    const { id } = await params
    const body = await req.json()
    const { nome, data, local, faixa, categoria, observacoes, participacoes } = body

    const existente = await prisma.competicao.findFirst({
      where: { id, academiaId: session.user.academiaId },
      select: { id: true },
    })
    if (!existente) {
      return NextResponse.json({ error: "Competição não encontrada" }, { status: 404 })
    }

    if (participacoes && participacoes.length) {
      const alunoIds = participacoes.map((p: { alunoId: string }) => p.alunoId)
      const alunos = await prisma.usuario.findMany({
        where: { id: { in: alunoIds }, academiaId: session.user.academiaId, role: "aluno" },
        select: { id: true },
      })
      const validos = new Set(alunos.map((a) => a.id))
      const invalidos = alunoIds.filter((id: string) => !validos.has(id))
      if (invalidos.length) {
        return NextResponse.json({ error: "Aluno fora da sua academia" }, { status: 400 })
      }
    }

    const competicao = await prisma.competicao.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(data && { data: new Date(data) }),
        ...(local !== undefined && { local }),
        ...(faixa !== undefined && { faixa }),
        ...(categoria !== undefined && { categoria }),
        ...(observacoes !== undefined && { observacoes }),
      },
      include: {
        participacoes: {
          include: { aluno: { select: { id: true, nome: true, faixa: true, avatar: true } } },
        },
      },
    })

    if (participacoes) {
      await prisma.participacaoCompeticao.deleteMany({ where: { competicaoId: id } })
      if (participacoes.length > 0) {
        await prisma.participacaoCompeticao.createMany({
          data: participacoes.map((p: { alunoId: string; posicao?: string; categoria?: string; observacao?: string }) => ({
            competicaoId: id,
            alunoId: p.alunoId,
            posicao: p.posicao || null,
            categoria: p.categoria || null,
            observacao: p.observacao || null,
          })),
        })
      }
    }

    const updated = await prisma.competicao.findUnique({
      where: { id },
      include: {
        participacoes: {
          include: { aluno: { select: { id: true, nome: true, faixa: true, avatar: true } } },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

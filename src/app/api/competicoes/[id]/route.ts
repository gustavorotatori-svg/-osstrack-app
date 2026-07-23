import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.academiaId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  if (session.user.role === "aluno") return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { nome, data, local, faixa, categoria, observacoes, participacoes } = body

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
}

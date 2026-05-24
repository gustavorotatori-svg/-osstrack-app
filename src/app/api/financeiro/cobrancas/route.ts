import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const where: any = { academiaId: session.user.academiaId }
  if (session.user.role === "aluno") where.alunoId = session.user.id

  const cobrancas = await prisma.cobranca.findMany({
    where,
    include: { aluno: { select: { id: true, nome: true, faixa: true } }, contrato: { include: { plano: { select: { nome: true } } } } },
    orderBy: { dataVencimento: "desc" },
    take: 100,
  })

  return NextResponse.json(cobrancas)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { contratoId } = await req.json()
  if (!contratoId) return NextResponse.json({ error: "contratoId obrigatório" }, { status: 400 })

  const contrato = await prisma.contrato.findUnique({ where: { id: contratoId }, include: { plano: true } })
  if (!contrato) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 })

  const now = new Date()
  const mes = now.getMonth() + 1
  const ano = now.getFullYear()
  const vencimento = new Date(ano, mes, contrato.diaVencimento)

  const jaExiste = await prisma.cobranca.findFirst({
    where: { contratoId, dataVencimento: { gte: new Date(ano, mes - 1, 1), lt: new Date(ano, mes, 1) } },
  })
  if (jaExiste) return NextResponse.json({ error: "Cobrança já gerada para este mês" }, { status: 409 })

  const cobranca = await prisma.cobranca.create({
    data: {
      academiaId: session.user.academiaId, contratoId,
      alunoId: contrato.alunoId, valor: contrato.valor,
      dataVencimento: vencimento,
    },
  })

  return NextResponse.json(cobranca, { status: 201 })
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono" || !session.user.academiaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const cobrancas = await prisma.cobranca.findMany({
    where: { academiaId: session.user.academiaId },
    include: {
      aluno: { select: { id: true, nome: true, faixa: true, grau: true } },
      contrato: { select: { id: true, plano: { select: { nome: true } } } },
    },
    orderBy: { dataVencimento: "desc" },
  })

  return NextResponse.json(cobrancas)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono" || !session.user.academiaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { acao } = body

  if (acao === "gerar-todas") {
    const contratos = await prisma.contrato.findMany({
      where: { academiaId: session.user.academiaId, status: { in: ["ativo", "inadimplente"] } },
      include: { cobrancas: { orderBy: { dataVencimento: "desc" }, take: 1 } },
    })

    const now = new Date()
    const mes = now.getMonth()
    const ano = now.getFullYear()
    const vencimento = new Date(ano, mes + 1, 10)
    const criadas: any[] = []

    for (const contrato of contratos) {
      const ultima = contrato.cobrancas[0]
      if (ultima) {
        const ultimaData = new Date(ultima.dataVencimento)
        if (ultimaData.getMonth() === mes && ultimaData.getFullYear() === ano) continue
      }

      const cobranca = await prisma.cobranca.create({
        data: {
          contratoId: contrato.id,
          alunoId: contrato.alunoId,
          academiaId: contrato.academiaId,
          valor: contrato.valor,
          dataVencimento: vencimento,
          status: "pendente",
        },
        include: {
          aluno: { select: { id: true, nome: true } },
        },
      })
      criadas.push(cobranca)
    }

    return NextResponse.json({ criadas: criadas.length })
  }

  const { contratoId, valor, vencimento, observacao } = body
  if (!contratoId) {
    return NextResponse.json({ error: "contratoId é obrigatório" }, { status: 400 })
  }

  const contrato = await prisma.contrato.findFirst({
    where: { id: contratoId, academiaId: session.user.academiaId },
  })
  if (!contrato) {
    return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 })
  }

  const cobranca = await prisma.cobranca.create({
    data: {
      contratoId,
      alunoId: contrato.alunoId,
      academiaId: contrato.academiaId,
      valor: Math.round((valor || contrato.valor / 100) * 100),
      dataVencimento: vencimento ? new Date(vencimento) : new Date(),
      observacao,
    },
    include: {
      aluno: { select: { id: true, nome: true } },
      contrato: { select: { id: true, plano: { select: { nome: true } } } },
    },
  })

  return NextResponse.json(cobranca)
}

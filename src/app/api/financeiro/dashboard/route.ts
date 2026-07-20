import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET() {
  try {
  const session = await getServerSession(authOptions)
  if (!session || !["dono", "professor"].includes(session.user.role) || !session.user.academiaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const academiaId = session.user.academiaId
  const now = new Date()
  const mesAtual = now.getMonth()
  const anoAtual = now.getFullYear()

  const nowMonth = new Date(anoAtual, mesAtual, 1)
  const nextMonth = new Date(anoAtual, mesAtual + 1, 1)

  const [
    totalPlanos,
    contratosAtivos,
    totalAlunos,
    cobrancasMes,
    cobrancasPendentesMes,
    cobrancasPagasMes,
    ultimasCobrancas,
    receitaMes,
    inadimplentes,
    despesasMes,
    despesasPagasMes,
    ultimasDespesas,
    wellhubCheckinsMes,
  ] = await Promise.all([
    prisma.planoMensalidade.count({ where: { academiaId, ativo: true } }),

    prisma.contrato.count({
      where: { academiaId, status: { in: ["ativo", "inadimplente"] } },
    }),

    prisma.usuario.count({
      where: { academiaId, role: "aluno" },
    }),

    prisma.cobranca.findMany({
      where: {
        academiaId,
        dataVencimento: {
          gte: new Date(anoAtual, mesAtual, 1),
          lt: new Date(anoAtual, mesAtual + 1, 1),
        },
      },
      include: { aluno: { select: { nome: true } } },
      orderBy: { dataVencimento: "desc" },
    }),

    prisma.cobranca.count({
      where: {
        academiaId,
        status: { in: ["pendente", "atrasado"] },
        dataVencimento: {
          gte: new Date(anoAtual, mesAtual, 1),
          lt: new Date(anoAtual, mesAtual + 1, 1),
        },
      },
    }),

    prisma.cobranca.count({
      where: {
        academiaId,
        status: "pago",
        dataVencimento: {
          gte: new Date(anoAtual, mesAtual, 1),
          lt: new Date(anoAtual, mesAtual + 1, 1),
        },
      },
    }),

    prisma.cobranca.findMany({
      where: { academiaId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        aluno: { select: { id: true, nome: true, faixa: true } },
        contrato: { select: { plano: { select: { nome: true } } } },
      },
    }),

    prisma.cobranca.aggregate({
      where: {
        academiaId,
        status: "pago",
        dataVencimento: {
          gte: new Date(anoAtual, mesAtual, 1),
          lt: new Date(anoAtual, mesAtual + 1, 1),
        },
      },
      _sum: { valor: true },
    }),

    prisma.usuario.findMany({
      where: {
        academiaId,
        role: "aluno",
        contratos: { some: { status: "inadimplente" } },
      },
      select: { id: true, nome: true },
    }),

    prisma.despesa.findMany({
      where: {
        academiaId,
        dataVencimento: {
          gte: new Date(anoAtual, mesAtual, 1),
          lt: new Date(anoAtual, mesAtual + 1, 1),
        },
      },
      orderBy: { dataVencimento: "desc" },
    }),

    prisma.despesa.aggregate({
      where: {
        academiaId,
        status: "pago",
        dataVencimento: {
          gte: new Date(anoAtual, mesAtual, 1),
          lt: new Date(anoAtual, mesAtual + 1, 1),
        },
      },
      _sum: { valor: true },
    }),

    prisma.despesa.findMany({
      where: { academiaId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),

    prisma.presenca.count({
      where: {
        aluno: { academiaId },
        origem: "wellhub",
        data: { gte: nowMonth, lt: nextMonth },
      },
    }),
  ])

  const receitaTotal = receitaMes._sum.valor || 0
  const despesaTotal = despesasPagasMes._sum.valor || 0
  const valorPotencialMes = cobrancasMes.reduce((acc, c) => acc + c.valor, 0)
  const totalDespesasMes = despesasMes.reduce((acc, d) => acc + d.valor, 0)
  const totalCobrancasMes = cobrancasMes.length

  return NextResponse.json({
    totalPlanos,
    contratosAtivos,
    totalAlunos,
    totalCobrancasMes,
    cobrancasPendentesMes,
    cobrancasPagasMes,
    receitaMes: receitaTotal,
    despesaMes: despesaTotal,
    totalDespesasMes,
    valorPotencialMes,
    fluxoCaixa: receitaTotal - despesaTotal,
    inadimplentes: inadimplentes.length,
    inadimplentesList: inadimplentes,
    ultimasCobrancas,
    ultimasDespesas,
    wellhubCheckinsMes,
    taxaAdimplencia: totalCobrancasMes > 0
      ? Math.round((cobrancasPagasMes / totalCobrancasMes) * 100)
      : 0,
  })
  } catch (error) {
    return handleApiError(error)
  }

}
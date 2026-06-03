import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono" || !session.user.academiaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const academiaId = session.user.academiaId
  const now = new Date()
  const mesAtual = now.getMonth()
  const anoAtual = now.getFullYear()

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
  ])

  const receitaTotal = receitaMes._sum.valor || 0
  const valorPotencialMes = cobrancasMes.reduce((acc, c) => acc + c.valor, 0)
  const totalCobrancasMes = cobrancasMes.length

  return NextResponse.json({
    totalPlanos,
    contratosAtivos,
    totalAlunos,
    totalCobrancasMes,
    cobrancasPendentesMes,
    cobrancasPagasMes,
    receitaMes: receitaTotal,
    valorPotencialMes,
    inadimplentes: inadimplentes.length,
    inadimplentesList: inadimplentes,
    ultimasCobrancas,
    taxaAdimplencia: totalCobrancasMes > 0
      ? Math.round((cobrancasPagasMes / totalCobrancasMes) * 100)
      : 0,
  })
}

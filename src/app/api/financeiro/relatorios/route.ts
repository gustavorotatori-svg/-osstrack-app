import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const now = new Date()
  const mesAtual = now.getMonth()
  const anoAtual = now.getFullYear()
  const inicioMes = new Date(anoAtual, mesAtual, 1)
  const fimMes = new Date(anoAtual, mesAtual + 1, 0)

  const [totalAlunos, alunosAtivos, totalContratos, cobrancasMes, pagamentosMes, receitaEsperada, receitaRecebida] = await Promise.all([
    prisma.usuario.count({ where: { academiaId: session.user.academiaId, role: "aluno" } }),
    prisma.usuario.count({ where: { academiaId: session.user.academiaId, role: "aluno", plano: "premium" } }),
    prisma.contrato.count({ where: { academiaId: session.user.academiaId, status: "ativo" } }),
    prisma.cobranca.count({ where: { academiaId: session.user.academiaId, dataVencimento: { gte: inicioMes, lte: fimMes } } }),
    prisma.cobranca.count({ where: { academiaId: session.user.academiaId, status: "pago", dataPagamento: { gte: inicioMes, lte: fimMes } } }),
    prisma.cobranca.aggregate({ where: { academiaId: session.user.academiaId, dataVencimento: { gte: inicioMes, lte: fimMes } }, _sum: { valor: true } }),
    prisma.cobranca.aggregate({ where: { academiaId: session.user.academiaId, status: "pago", dataPagamento: { gte: inicioMes, lte: fimMes } }, _sum: { valor: true } }),
  ])

  const cobrancasAtrasadas = await prisma.cobranca.count({
    where: { academiaId: session.user.academiaId, status: "pendente", dataVencimento: { lt: now } },
  })

  return NextResponse.json({
    totalAlunos, alunosAtivos, inadimplencia: totalAlunos > 0 ? Math.round(((totalAlunos - alunosAtivos) / totalAlunos) * 100) : 0,
    totalContratos, cobrancasMes, pagamentosMes,
    receitaEsperada: receitaEsperada._sum.valor || 0,
    receitaRecebida: receitaRecebida._sum.valor || 0,
    cobrancasAtrasadas,
  })
}

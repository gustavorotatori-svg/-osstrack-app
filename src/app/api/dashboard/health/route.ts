import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.academiaId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  if (session.user.role === "aluno") return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

  const agora = new Date()
  const dias30 = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000)
  const dias7 = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [totalAlunos, presencas30d, presencas7d, cobrancasPendentes, totalPresencas] = await Promise.all([
    prisma.usuario.count({ where: { academiaId: session.user.academiaId, role: "aluno" } }),

    prisma.presenca.findMany({
      where: { createdAt: { gte: dias30 }, status: "confirmed" },
      select: { alunoId: true },
      distinct: ["alunoId"],
    }).then((r) => r.length),

    prisma.presenca.findMany({
      where: { createdAt: { gte: dias7 }, status: "confirmed" },
      select: { alunoId: true },
      distinct: ["alunoId"],
    }).then((r) => r.length),

    prisma.cobranca.aggregate({
      where: { academiaId: session.user.academiaId, status: "pendente" },
      _sum: { valor: true },
    }).then((r) => r._sum.valor || 0),

    prisma.presenca.count({
      where: { createdAt: { gte: dias30 }, status: "confirmed" },
    }),
  ])

  const mediaTreinosPorAluno = totalAlunos > 0
    ? Math.round((totalPresencas / totalAlunos) * 10) / 10
    : 0

  const taxaComparecimento = totalAlunos > 0
    ? Math.round((presencas7d / totalAlunos) * 100)
    : 0

  let healthScore = 50
  if (totalAlunos > 0) {
    const retencaoScore = (presencas30d / totalAlunos) * 40
    const frequenciaScore = Math.min(mediaTreinosPorAluno * 4, 30)
    const financeiroScore = cobrancasPendentes === 0 ? 20 : cobrancasPendentes < 1000 ? 10 : 0
    const engajamentoScore = taxaComparecimento >= 60 ? 10 : taxaComparecimento >= 40 ? 5 : 0
    healthScore = Math.round(Math.min(retencaoScore + frequenciaScore + financeiroScore + engajamentoScore, 100))
  }

  let nivel: "excelente" | "bom" | "atencao" | "critico" = "critico"
  if (healthScore >= 80) nivel = "excelente"
  else if (healthScore >= 60) nivel = "bom"
  else if (healthScore >= 40) nivel = "atencao"

  return NextResponse.json({
    healthScore,
    nivel,
    metrics: {
      totalAlunos,
      ativos30d: presencas30d,
      ativos7d: presencas7d,
      mediaTreinosPorAluno,
      taxaComparecimento,
      cobrancasPendentes,
      totalPresencas30d: totalPresencas,
    },
  })
}

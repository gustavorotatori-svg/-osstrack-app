import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET() {
  try {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const academiaId = session.user.academiaId
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)

  const seisMesesAtras = new Date()
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6)

  // Total de alunos ativos
  const totalAlunos = await prisma.usuario.count({
    where: { academiaId, role: "aluno" },
  })

  // Presenças hoje
  const presencasHoje = await prisma.presenca.count({
    where: {
      aluno: { academiaId },
      data: { gte: hoje, lt: amanha },
      status: "confirmed",
    },
  })

  // Total de presenças confirmadas
  const totalPresencas = await prisma.presenca.count({
    where: { aluno: { academiaId }, status: "confirmed" },
  })

  // Presenças por mês (6 meses)
  const presencasMensais = await prisma.presenca.groupBy({
    by: ["data"],
    where: {
      aluno: { academiaId },
      status: "confirmed",
      data: { gte: seisMesesAtras },
    },
    _count: true,
  })

  const presencasMesMap = new Map<string, number>()
  presencasMensais.forEach((p) => {
    const key = `${p.data.getFullYear()}-${String(p.data.getMonth() + 1).padStart(2, "0")}`
    presencasMesMap.set(key, (presencasMesMap.get(key) || 0) + p._count)
  })

  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
  const presencasPorMes = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    return {
      mes: `${meses[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
      total: presencasMesMap.get(key) || 0,
    }
  })

  // Alunos ativos (presença nos últimos 90 dias)
  const noventaDiasAtras = new Date()
  noventaDiasAtras.setDate(noventaDiasAtras.getDate() - 90)

  const alunosAtivos = await prisma.presenca.groupBy({
    by: ["alunoId"],
    where: {
      aluno: { academiaId },
      data: { gte: noventaDiasAtras },
      status: "confirmed",
    },
    _count: true,
  })

  // Engajamento = alunos que treinaram na última semana
  const semanaAtras = new Date()
  semanaAtras.setDate(semanaAtras.getDate() - 7)

  const alunosSemana = await prisma.presenca.groupBy({
    by: ["alunoId"],
    where: {
      aluno: { academiaId },
      data: { gte: semanaAtras },
      status: "confirmed",
    },
    _count: true,
  })

  const engajamento = totalAlunos > 0 ? Math.round((alunosSemana.length / totalAlunos) * 100) : 0
  const retencao6m = totalAlunos > 0 ? Math.round((alunosAtivos.length / totalAlunos) * 100) : 0

  // ---------- Financeiro ----------
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1)

  const receitasMes = await prisma.cobranca.aggregate({
    _sum: { valor: true },
    _count: { id: true },
    where: { academiaId, status: "pago", dataPagamento: { gte: inicioMes, lt: fimMes } },
  })

  const despesasMes = await prisma.despesa.aggregate({
    _sum: { valor: true },
    where: { academiaId, status: "pago", dataPagamento: { gte: inicioMes, lt: fimMes } },
  })

  const inadimplentesCount = await prisma.cobranca.count({
    where: { academiaId, status: "pendente", dataVencimento: { lt: hoje } },
  })

  const cobrancasMesCount = await prisma.cobranca.count({
    where: { academiaId, dataVencimento: { gte: inicioMes, lt: fimMes } },
  })

  const pagasMes = receitasMes._count?.id || 0
  const receita = receitasMes._sum?.valor || 0
  const despesa = despesasMes._sum?.valor || 0
  const ticketMedio = pagasMes > 0 ? Math.round(receita / pagasMes) : 0
  const inadimplencia = cobrancasMesCount > 0 ? Math.round((inadimplentesCount / cobrancasMesCount) * 100) : 0
  const lucroMes = receita - despesa

  // ---------- Churn (cancelamentos no mês) ----------
  const canceladosMes = await prisma.contrato.count({
    where: { academiaId, status: "cancelado", updatedAt: { gte: inicioMes } },
  })
  const churn = totalAlunos > 0 ? Math.round((canceladosMes / totalAlunos) * 100) : 0

  // ---------- Por turma (últimos 30 dias) ----------
  const trintaDiasAtras = new Date()
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)

  const presencasPorTurmaRaw = await prisma.presenca.groupBy({
    by: ["turma"],
    where: {
      aluno: { academiaId },
      status: "confirmed",
      data: { gte: trintaDiasAtras },
    },
    _count: true,
  })

  const presencasPorTurma = presencasPorTurmaRaw
    .filter((p) => p.turma)
    .map((p) => ({ turma: p.turma, total: p._count }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)

  // ---------- Alunos por faixa ----------
  const porFaixaRaw = await prisma.usuario.groupBy({
    by: ["faixa"],
    where: { academiaId, role: "aluno" },
    _count: true,
  })
  const porFaixa = porFaixaRaw
    .map((f) => ({ faixa: f.faixa || "Outra", total: f._count }))
    .sort((a, b) => b.total - a.total)

  return NextResponse.json({
    presencasHoje,
    totalPresencas,
    totalAlunos,
    presencasPorMes,
    engajamento,
    retencao6m,
    alunosAtivos: alunosAtivos.length,
    alunosSemana: alunosSemana.length,
    financeiro: {
      receitaMes: receita,
      despesasMes: despesa,
      lucroMes,
      ticketMedio,
      pagasMes,
      inadimplentes: inadimplentesCount,
      inadimplencia,
    },
    churn,
    canceladosMes,
    presencasPorTurma,
    porFaixa,
  })
  } catch (error) {
    return handleApiError(error)
  }
}

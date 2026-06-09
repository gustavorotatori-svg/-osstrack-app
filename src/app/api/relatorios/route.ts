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

  return NextResponse.json({
    presencasHoje,
    totalPresencas,
    totalAlunos,
    presencasPorMes,
    engajamento,
    retencao6m,
    alunosAtivos: alunosAtivos.length,
    alunosSemana: alunosSemana.length,
  })
  } catch (error) {
    return handleApiError(error)
  }
}

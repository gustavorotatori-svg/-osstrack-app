import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.academiaId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const academiaId = session.user.academiaId

    // Get all alunos from this academia
    const alunos = await prisma.usuario.findMany({
      where: { academiaId, role: "aluno" },
      select: { id: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    })

    const hoje = new Date()
    hoje.setHours(23, 59, 59, 999)

    // Group alunos by month-cohort
    const cohorts: Record<string, { total: number; d1: number; d7: number; d30: number }> = {}
    const now = Date.now()

    for (const a of alunos) {
      const created = new Date(a.createdAt)
      const cohortKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`
      if (!cohorts[cohortKey]) cohorts[cohortKey] = { total: 0, d1: 0, d7: 0, d30: 0 }
      cohorts[cohortKey].total++

      const diasDesdeCriacao = Math.floor((now - created.getTime()) / (1000 * 60 * 60 * 24))

      // D1: returned within 1 day of signup
      if (diasDesdeCriacao >= 1) {
        const d1End = new Date(created.getTime() + 1 * 24 * 60 * 60 * 1000)
        const d1Count = await prisma.presenca.count({
          where: { alunoId: a.id, status: "confirmed", data: { gte: created, lte: d1End } },
        })
        if (d1Count > 0) cohorts[cohortKey].d1++
      }

      // D7: returned within 7 days
      if (diasDesdeCriacao >= 7) {
        const d7End = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000)
        const d7Count = await prisma.presenca.count({
          where: { alunoId: a.id, status: "confirmed", data: { gte: created, lte: d7End } },
        })
        if (d7Count > 0) cohorts[cohortKey].d7++
      }

      // D30: returned within 30 days
      if (diasDesdeCriacao >= 30) {
        const d30End = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000)
        const d30Count = await prisma.presenca.count({
          where: { alunoId: a.id, status: "confirmed", data: { gte: created, lte: d30End } },
        })
        if (d30Count > 0) cohorts[cohortKey].d30++
      }
    }

    // Overall retention
    const totalAlunos = alunos.length
    const eligibleD1 = alunos.filter((a) => Date.now() - new Date(a.createdAt).getTime() >= 1 * 24 * 60 * 60 * 1000).length
    const eligibleD7 = alunos.filter((a) => Date.now() - new Date(a.createdAt).getTime() >= 7 * 24 * 60 * 60 * 1000).length
    const eligibleD30 = alunos.filter((a) => Date.now() - new Date(a.createdAt).getTime() >= 30 * 24 * 60 * 60 * 1000).length

    const cohortValues = Object.entries(cohorts).map(([mes, c]) => ({
      mes,
      total: c.total,
      d1: c.total > 0 ? Math.round((c.d1 / c.total) * 100) : 0,
      d7: c.total > 0 ? Math.round((c.d7 / c.total) * 100) : 0,
      d30: c.total > 0 ? Math.round((c.d30 / c.total) * 100) : 0,
    })).sort((a, b) => a.mes.localeCompare(b.mes))

    const lastCohort = cohortValues[cohortValues.length - 1]

    return NextResponse.json({
      cohorts: cohortValues,
      overall: {
        d1: eligibleD1 > 0 ? Math.round((Object.values(cohorts).reduce((s, c) => s + c.d1, 0) / eligibleD1) * 100) : 0,
        d7: eligibleD7 > 0 ? Math.round((Object.values(cohorts).reduce((s, c) => s + c.d7, 0) / eligibleD7) * 100) : 0,
        d30: eligibleD30 > 0 ? Math.round((Object.values(cohorts).reduce((s, c) => s + c.d30, 0) / eligibleD30) * 100) : 0,
      },
      lastCohort: lastCohort ? {
        mes: lastCohort.mes,
        d1: lastCohort.d1,
        d7: lastCohort.d7,
        d30: lastCohort.d30,
      } : null,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

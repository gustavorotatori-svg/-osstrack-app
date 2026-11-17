import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

type RetentionCohortRow = {
  mes: string
  total: number
  eligibleD1: number
  retainedD1: number
  eligibleD7: number
  retainedD7: number
  eligibleD30: number
  retainedD30: number
}

function rate(retained: number, eligible: number) {
  return eligible > 0 ? Math.round((retained / eligible) * 100) : null
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.academiaId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const academiaId = session.user.academiaId
    const now = new Date()
    const rows = await prisma.$queryRaw<RetentionCohortRow[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', u."createdAt"), 'YYYY-MM') AS mes,
        COUNT(*)::int AS total,
        (COUNT(*) FILTER (WHERE u."createdAt" <= ${now} - INTERVAL '1 day'))::int AS "eligibleD1",
        (COUNT(*) FILTER (WHERE EXISTS (
          SELECT 1 FROM "Presenca" p
          WHERE p."alunoId" = u.id AND p.status = 'confirmed'
            AND p.data >= u."createdAt" + INTERVAL '1 day'
            AND p.data < u."createdAt" + INTERVAL '2 days'
        )))::int AS "retainedD1",
        (COUNT(*) FILTER (WHERE u."createdAt" <= ${now} - INTERVAL '8 days'))::int AS "eligibleD7",
        (COUNT(*) FILTER (WHERE EXISTS (
          SELECT 1 FROM "Presenca" p
          WHERE p."alunoId" = u.id AND p.status = 'confirmed'
            AND p.data >= u."createdAt" + INTERVAL '7 days'
            AND p.data < u."createdAt" + INTERVAL '8 days'
        )))::int AS "retainedD7",
        (COUNT(*) FILTER (WHERE u."createdAt" <= ${now} - INTERVAL '31 days'))::int AS "eligibleD30",
        (COUNT(*) FILTER (WHERE EXISTS (
          SELECT 1 FROM "Presenca" p
          WHERE p."alunoId" = u.id AND p.status = 'confirmed'
            AND p.data >= u."createdAt" + INTERVAL '30 days'
            AND p.data < u."createdAt" + INTERVAL '31 days'
        )))::int AS "retainedD30"
      FROM "Usuario" u
      WHERE u."academiaId" = ${academiaId} AND u.role = 'aluno'
      GROUP BY DATE_TRUNC('month', u."createdAt")
      ORDER BY DATE_TRUNC('month', u."createdAt")
    `

    const cohorts = rows.map((row) => ({
      mes: row.mes,
      total: row.total,
      d1: rate(row.retainedD1, row.eligibleD1),
      d7: rate(row.retainedD7, row.eligibleD7),
      d30: rate(row.retainedD30, row.eligibleD30),
      eligible: { d1: row.eligibleD1, d7: row.eligibleD7, d30: row.eligibleD30 },
      retained: { d1: row.retainedD1, d7: row.retainedD7, d30: row.retainedD30 },
    }))

    const overall = rows.reduce(
      (totals, row) => ({
        eligibleD1: totals.eligibleD1 + row.eligibleD1,
        retainedD1: totals.retainedD1 + row.retainedD1,
        eligibleD7: totals.eligibleD7 + row.eligibleD7,
        retainedD7: totals.retainedD7 + row.retainedD7,
        eligibleD30: totals.eligibleD30 + row.eligibleD30,
        retainedD30: totals.retainedD30 + row.retainedD30,
      }),
      { eligibleD1: 0, retainedD1: 0, eligibleD7: 0, retainedD7: 0, eligibleD30: 0, retainedD30: 0 },
    )

    const lastCohort = cohorts.at(-1) || null

    return NextResponse.json({
      cohorts,
      overall: {
        d1: rate(overall.retainedD1, overall.eligibleD1),
        d7: rate(overall.retainedD7, overall.eligibleD7),
        d30: rate(overall.retainedD30, overall.eligibleD30),
        eligible: { d1: overall.eligibleD1, d7: overall.eligibleD7, d30: overall.eligibleD30 },
        retained: { d1: overall.retainedD1, d7: overall.retainedD7, d30: overall.retainedD30 },
      },
      lastCohort,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

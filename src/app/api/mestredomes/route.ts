import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    // Allow Vercel cron, custom cron trigger, or authenticated admin
    const isVercelCron = req.headers.get("x-vercel-cron") === "1"
    const isCronWithSecret = process.env.CRON_SECRET && req.headers.get("x-cron-secret") === process.env.CRON_SECRET

    if (!isVercelCron && !isCronWithSecret) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== "dono") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
      }
    }
    const academias = await prisma.academia.findMany()

    const results = []
    for (const academia of academias) {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const ranking = await prisma.presenca.groupBy({
        by: ["alunoId"],
        where: {
          status: "confirmed",
          data: { gte: startOfMonth, lte: endOfMonth },
          aluno: { academiaId: academia.id },
        },
        _count: true,
        orderBy: { _count: { alunoId: "desc" } },
        take: 1,
      })

      if (ranking.length === 0) {
        results.push({ academia: academia.nome, message: "Nenhum aluno com presenças este mês" })
        continue
      }

      const top = ranking[0]
      await prisma.mestreDoMes.upsert({
        where: { academiaId_mes_ano: { academiaId: academia.id, mes: now.getMonth() + 1, ano: now.getFullYear() } },
        update: { alunoId: top.alunoId, totalAulas: top._count },
        create: { academiaId: academia.id, alunoId: top.alunoId, mes: now.getMonth() + 1, ano: now.getFullYear(), totalAulas: top._count },
      })

      const aluno = await prisma.usuario.findUnique({ where: { id: top.alunoId } })
      results.push({ academia: academia.nome, mestre: aluno?.nome, aulas: top._count })
    }

    return NextResponse.json({ message: "Mestre do Mês calculado!", results })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao calcular Mestre do Mês" }, { status: 500 })
  }
}

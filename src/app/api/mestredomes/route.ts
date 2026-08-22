import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notificarUsuario } from "@/lib/notificar"

const CATEGORIAS = ["adulto", "master", "infantil"]

export async function POST(req: NextRequest) {
  try {
    const isVercelCron = req.headers.get("x-vercel-cron") === "1"
    const isCronWithSecret = process.env.CRON_SECRET && req.headers.get("x-cron-secret") === process.env.CRON_SECRET

    if (!isVercelCron && !isCronWithSecret) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== "dono") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
      }
    }

    const now = new Date()
    const mes = isVercelCron || isCronWithSecret
      ? now.getMonth()
      : now.getMonth() + 1
    const ano = mes === 0 ? now.getFullYear() - 1 : now.getFullYear()
    const mesAlvo = mes === 0 ? 12 : mes

    const startOfMonth = new Date(ano, mesAlvo - 1, 1)
    const endOfMonth = new Date(ano, mesAlvo, 0)

    const academias = await prisma.academia.findMany()
    const results = []

    for (const academia of academias) {
      const resultadosAcademia: Record<string, unknown> = { academia: academia.nome }

      for (const categoria of CATEGORIAS) {
        const ranking = await prisma.presenca.groupBy({
          by: ["alunoId"],
          where: {
            status: "confirmed",
            data: { gte: startOfMonth, lte: endOfMonth },
            aluno: { academiaId: academia.id, categoria },
          },
          _count: true,
          orderBy: { _count: { alunoId: "desc" } },
          take: 1,
        })

        if (ranking.length === 0) {
          resultadosAcademia[categoria] = "Nenhum aluno com presenças"
          continue
        }

        const top = ranking[0]
        await prisma.alunoDoMes.upsert({
          where: { academiaId_mes_ano_categoria: { academiaId: academia.id, mes: mesAlvo, ano, categoria } },
          update: { alunoId: top.alunoId, totalAulas: top._count },
          create: { academiaId: academia.id, alunoId: top.alunoId, mes: mesAlvo, ano, categoria, totalAulas: top._count },
        })

        const aluno = await prisma.usuario.findUnique({ where: { id: top.alunoId }, select: { id: true, nome: true } })
        if (aluno) {
          await notificarUsuario({
            usuarioId: aluno.id,
            tipo: "conquista",
            titulo: "Mestre do Mes!",
            descricao: `Voce foi o aluno com mais presencas em ${categoria} este mes! Parabens!`,
            link: "/dashboard/aluno/ranking",
          }).catch(() => {})
        }
        resultadosAcademia[categoria] = { mestre: aluno?.nome, aulas: top._count }
      }

      results.push(resultadosAcademia)
    }

    await prisma.cronLog.create({ data: { tipo: "mestredomes" } }).catch(() => {})

    return NextResponse.json({ message: "Mestres do Mês calculados!", results })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao calcular Mestres do Mês" }, { status: 500 })
  }
}
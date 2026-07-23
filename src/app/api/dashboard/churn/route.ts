import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.academiaId) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  if (session.user.role === "aluno") return NextResponse.json({ error: "Sem permissão" }, { status: 403 })

  const agora = new Date()
  const dias7 = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)
  const dias14 = new Date(agora.getTime() - 14 * 24 * 60 * 60 * 1000)
  const dias30 = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000)

  const todosAlunos = await prisma.usuario.findMany({
    where: { academiaId: session.user.academiaId, role: "aluno" },
    select: {
      id: true,
      nome: true,
      faixa: true,
      avatar: true,
      createdAt: true,
      presencas: {
        where: { status: "confirmed" },
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })

  const churnAlunos = todosAlunos
    .map((aluno) => {
      const ultimoCheckin = aluno.presencas[0]?.createdAt
      const diasSemTreinar = ultimoCheckin
        ? Math.floor((agora.getTime() - new Date(ultimoCheckin).getTime()) / (1000 * 60 * 60 * 24))
        : 999

      let risco: "critico" | "alto" | "medio" | "baixo" = "baixo"
      let motivo = ""

      if (diasSemTreinar >= 30) {
        risco = "critico"
        motivo = `${diasSemTreinar}d sem treinar`
      } else if (diasSemTreinar >= 14) {
        risco = "alto"
        motivo = `${diasSemTreinar}d sem treinar`
      } else if (diasSemTreinar >= 7) {
        risco = "medio"
        motivo = `${diasSemTreinar}d sem treinar`
      }

      if (!ultimoCheckin) {
        risco = "critico"
        motivo = "Nunca fez check-in"
      }

      return { ...aluno, ultimoCheckin, diasSemTreinar, risco, motivo, presencas: undefined }
    })
    .filter((a) => a.risco !== "baixo")
    .sort((a, b) => {
      const ordem = { critico: 0, alto: 1, medio: 2, baixo: 3 }
      return ordem[a.risco] - ordem[b.risco]
    })

  const totalAtivos30d = todosAlunos.filter((a) =>
    a.presencas.some((p) => new Date(p.createdAt) >= dias30)
  ).length

  const taxaRetencao = todosAlunos.length > 0
    ? Math.round((totalAtivos30d / todosAlunos.length) * 100)
    : 0

  return NextResponse.json({
    alunosEmRisco: churnAlunos,
    totalAlunos: todosAlunos.length,
    ativos30d: totalAtivos30d,
    taxaRetencao,
  })
}

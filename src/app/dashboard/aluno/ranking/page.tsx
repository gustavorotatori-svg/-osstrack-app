import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { RankingClient } from "./client"

export default async function RankingPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "aluno") redirect("/login")

  const academia = await prisma.academia.findUnique({
    where: { id: session.user.academiaId },
    select: { rankingVisivel: true },
  })

  const alunos = await prisma.usuario.findMany({
    where: { academiaId: session.user.academiaId, role: "aluno" },
    orderBy: { nome: "asc" },
  })

  const presencasCount = await prisma.presenca.groupBy({
    by: ["alunoId"],
    where: { status: "confirmed" },
    _count: true,
  })

  const ranking = alunos
    .map((a) => ({
      id: a.id,
      nome: a.nome,
      faixa: a.faixa,
      grau: a.grau,
      avatar: a.avatar,
      categoria: a.categoria,
      totalAulas: presencasCount.find((p) => p.alunoId === a.id)?._count || 0,
      posicao: 0,
    }))
    .sort((a, b) => b.totalAulas - a.totalAulas)
    .map((a, i) => ({ ...a, posicao: i + 1 }))

  const belts = [...new Set(ranking.map((a) => a.faixa))].sort()

  const now = new Date()
  const mestre = await prisma.mestreDoMes.findFirst({
    where: { academiaId: session.user.academiaId, mes: now.getMonth() + 1, ano: now.getFullYear() },
    include: { aluno: { select: { nome: true, faixa: true, grau: true, avatar: true } } },
  })

  return (
    <RankingClient
      initialRanking={ranking}
      alunoId={session.user.id}
      belts={belts}
      initialMestre={mestre ? { nome: mestre.aluno.nome, faixa: mestre.aluno.faixa, grau: mestre.aluno.grau, avatar: mestre.aluno.avatar, totalAulas: mestre.totalAulas } : null}
      visivel={academia?.rankingVisivel ?? true}
    />
  )
}

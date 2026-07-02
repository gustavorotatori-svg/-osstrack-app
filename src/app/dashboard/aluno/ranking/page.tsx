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
      nivelDisciplina: a.nivelDisciplina,
      totalAulas: presencasCount.find((p) => p.alunoId === a.id)?._count || 0,
      posicao: 0,
    }))
    .sort((a, b) => b.totalAulas - a.totalAulas)
    .map((a, i) => ({ ...a, posicao: i + 1 }))

  const beltOrder = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]
  const belts = [...new Set(ranking.map((a) => a.faixa))].sort((a, b) => beltOrder.indexOf(a) - beltOrder.indexOf(b))

  const now = new Date()
  const CATEGORIAS = ["adulto", "master", "infantil"]
  const mestres: Record<string, { nome: string; faixa: string; grau: number; avatar: string | null; totalAulas: number; categoria: string } | null> = {}
  for (const cat of CATEGORIAS) {
    let m = await prisma.mestreDoMes.findFirst({
      where: { academiaId: session.user.academiaId, mes: now.getMonth() + 1, ano: now.getFullYear(), categoria: cat },
      include: { aluno: { select: { nome: true, faixa: true, grau: true, avatar: true } } },
    })
    if (!m) {
      m = await prisma.mestreDoMes.findFirst({
        where: { academiaId: session.user.academiaId, categoria: cat },
        orderBy: [{ ano: "desc" }, { mes: "desc" }],
        include: { aluno: { select: { nome: true, faixa: true, grau: true, avatar: true } } },
      })
    }
    mestres[cat] = m
      ? { nome: m.aluno.nome, faixa: m.aluno.faixa, grau: m.aluno.grau, avatar: m.aluno.avatar, totalAulas: m.totalAulas, categoria: m.categoria }
      : null
  }

  return (
    <RankingClient
      initialRanking={ranking}
      alunoId={session.user.id}
      belts={belts}
      initialMestres={mestres}
      visivel={academia?.rankingVisivel ?? true}
    />
  )
}

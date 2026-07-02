import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET(request: Request) {
  try {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.academiaId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const categoria = searchParams.get("categoria") || "geral"
  const turmaId = searchParams.get("turmaId")
  const periodo = searchParams.get("periodo") || "total"
  const faixa = searchParams.get("faixa")

  const academia = await prisma.academia.findUnique({
    where: { id: session.user.academiaId },
    select: { rankingVisivel: true },
  })

  if (!academia) return NextResponse.json({ error: "Academia não encontrada" }, { status: 404 })

  // Alunos só podem ver o ranking se o dono permitir
  if (session.user.role === "aluno" && !academia.rankingVisivel) {
    return NextResponse.json({ error: "Ranking desativado pela academia" }, { status: 403 })
  }

  const now = new Date()
  let dateFilter: Date | null = null
  if (periodo === "mes") {
    dateFilter = new Date(now.getFullYear(), now.getMonth(), 1)
  } else if (periodo === "semana") {
    dateFilter = new Date(now)
    dateFilter.setDate(now.getDate() - now.getDay())
    dateFilter.setHours(0, 0, 0, 0)
  }

  const whereAluno: any = {
    academiaId: session.user.academiaId,
    role: "aluno",
  }
  if (categoria !== "geral") whereAluno.categoria = categoria
  if (faixa) whereAluno.faixa = faixa

  const alunos = await prisma.usuario.findMany({
    where: whereAluno,
    select: {
      id: true,
      nome: true,
      faixa: true,
      grau: true,
      avatar: true,
      categoria: true,
      nivelDisciplina: true,
    },
  })

  // Se filtrou por turma, pega só alunos dessa turma
  let alunoIds = alunos.map((a) => a.id)
  if (turmaId) {
    const alunosDaTurma = await prisma.turmaAluno.findMany({
      where: { turmaId },
      select: { alunoId: true },
    })
    const idsDaTurma = new Set(alunosDaTurma.map((t) => t.alunoId))
    alunoIds = alunoIds.filter((id) => idsDaTurma.has(id))
  }

  const wherePresenca: any = {
    alunoId: { in: alunoIds },
    status: "confirmed",
  }
  if (dateFilter) {
    wherePresenca.data = { gte: dateFilter }
  }

  const presencasCount = await prisma.presenca.groupBy({
    by: ["alunoId"],
    where: wherePresenca,
    _count: true,
  })

  const countMap = new Map(presencasCount.map((p) => [p.alunoId, p._count]))

  const ranking = alunos
    .filter((a) => alunoIds.includes(a.id))
    .map((a) => ({
      id: a.id,
      nome: a.nome,
      faixa: a.faixa,
      grau: a.grau,
      avatar: a.avatar,
      categoria: a.categoria,
      nivelDisciplina: a.nivelDisciplina,
      totalAulas: countMap.get(a.id) || 0,
    }))
    .sort((a, b) => b.totalAulas - a.totalAulas)
    .map((a, i) => ({ ...a, posicao: i + 1 }))

  const CATEGORIAS = ["adulto", "master", "infantil"]
  const mestres: Record<string, unknown> = {}
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

  return NextResponse.json({
    ranking,
    mestres,
    visivel: academia.rankingVisivel,
  })
  } catch (error) {
    return handleApiError(error)
  }
}

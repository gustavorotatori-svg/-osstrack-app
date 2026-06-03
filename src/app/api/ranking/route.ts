import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
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
      totalAulas: countMap.get(a.id) || 0,
    }))
    .sort((a, b) => b.totalAulas - a.totalAulas)
    .map((a, i) => ({ ...a, posicao: i + 1 }))

  const mestreDoMes = await prisma.mestreDoMes.findFirst({
    where: { academiaId: session.user.academiaId, mes: now.getMonth() + 1, ano: now.getFullYear() },
    include: { aluno: { select: { nome: true, faixa: true, grau: true, avatar: true } } },
  })

  return NextResponse.json({
    ranking,
    mestre: mestreDoMes
      ? { nome: mestreDoMes.aluno.nome, faixa: mestreDoMes.aluno.faixa, grau: mestreDoMes.aluno.grau, avatar: mestreDoMes.aluno.avatar, totalAulas: mestreDoMes.totalAulas }
      : null,
    visivel: academia.rankingVisivel,
  })
}

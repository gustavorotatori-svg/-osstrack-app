import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

const missoesTemplate = [
  { dia: 1, titulo: "Primeiro Check-in", descricao: "Faça seu primeiro check-in na academia", icone: "📍" },
  { dia: 2, titulo: "Conhecendo o Ranking", descricao: "Veja sua posição no ranking da academia", icone: "🏆" },
  { dia: 3, titulo: "Três Dias Seguidos", descricao: "Complete 3 check-ins seguidos", icone: "🔥" },
  { dia: 4, titulo: "Explore o Mural", descricao: "Veja as postagens do mural da academia", icone: "📢" },
  { dia: 5, titulo: "Semana Completa", descricao: "Complete 5 check-ins na semana", icone: "🎯" },
  { dia: 6, titulo: "Compartilhe", descricao: "Compartilhe sua evolução nas redes", icone: "📤" },
  { dia: 7, titulo: "Jornada Iniciada", descricao: "Complete todas as missões da primeira semana!", icone: "🏅" },
]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "aluno") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  let missoes = await prisma.missaoDiaria.findMany({
    where: { alunoId: session.user.id },
    orderBy: { dia: "asc" },
  })

  if (missoes.length === 0) {
    await prisma.missaoDiaria.createMany({
      data: missoesTemplate.map((m) => ({
        alunoId: session.user.id,
        dia: m.dia,
        titulo: m.titulo,
        descricao: m.descricao,
        icone: m.icone,
      })),
    })
    missoes = await prisma.missaoDiaria.findMany({
      where: { alunoId: session.user.id },
      orderBy: { dia: "asc" },
    })
  }

  return NextResponse.json(missoes)
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "aluno") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await request.json()

  const missao = await prisma.missaoDiaria.findFirst({
    where: { id, alunoId: session.user.id },
  })

  if (!missao) return NextResponse.json({ error: "Missão não encontrada" }, { status: 404 })

  const updated = await prisma.missaoDiaria.update({
    where: { id },
    data: { concluida: true },
  })

  return NextResponse.json(updated)
}

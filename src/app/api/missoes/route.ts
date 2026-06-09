import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

const onboardingTemplate = [
  { dia: 1, titulo: "Primeiro Check-in", descricao: "Faça seu primeiro check-in na academia", icone: "📍" },
  { dia: 2, titulo: "Conhecendo o Ranking", descricao: "Veja sua posição no ranking da academia", icone: "🏆" },
  { dia: 3, titulo: "Três Dias Seguidos", descricao: "Complete 3 check-ins seguidos", icone: "🔥" },
  { dia: 4, titulo: "Explore o Mural", descricao: "Veja as postagens do mural da academia", icone: "📢" },
  { dia: 5, titulo: "Semana Completa", descricao: "Complete 5 check-ins na semana", icone: "🎯" },
  { dia: 6, titulo: "Compartilhe", descricao: "Compartilhe sua evolução nas redes", icone: "📤" },
  { dia: 7, titulo: "Jornada Iniciada", descricao: "Complete todas as missões da primeira semana!", icone: "🏅" },
]

const diariasTemplate = [
  { dia: 1, titulo: "Treinar Hoje", descricao: "Faça check-in hoje e mantenha a consistência", icone: "🥋", pontos: 10 },
  { dia: 2, titulo: "Madrugador", descricao: "Faça check-in antes das 10h", icone: "🌅", pontos: 5 },
  { dia: 3, titulo: "Foco Total", descricao: "Complete 2 check-ins no mesmo dia (manhã + tarde)", icone: "🎯", pontos: 15 },
]

const semanaisTemplate = [
  { dia: 1, titulo: "Semana Cheia", descricao: "Complete 5 check-ins na semana", icone: "📅", pontos: 25 },
  { dia: 2, titulo: "Raio Contínuo", descricao: "Mantenha streak de 3+ dias durante a semana", icone: "⚡", pontos: 20 },
]

function getDailyResetToken(): string {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
}

function getWeeklyResetToken(): string {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  return `${startOfWeek.getFullYear()}-${startOfWeek.getMonth() + 1}-${startOfWeek.getDate()}`
}

async function ensureCyclicMissions(alunoId: string) {
  const dailyToken = getDailyResetToken()
  const weeklyToken = getWeeklyResetToken()

  // Check/create daily missions
  const dailyExists = await prisma.missaoDiaria.findFirst({
    where: { alunoId, tipo: "diaria", resetToken: dailyToken },
  })
  if (!dailyExists) {
    // Reset old daily missions
    await prisma.missaoDiaria.deleteMany({
      where: { alunoId, tipo: "diaria" },
    })
    await prisma.missaoDiaria.createMany({
      data: diariasTemplate.map((m) => ({
        alunoId,
        dia: m.dia,
        titulo: m.titulo,
        descricao: m.descricao,
        icone: m.icone,
        tipo: "diaria",
        pontos: m.pontos,
        resetToken: dailyToken,
      })),
    })
  }

  // Check/create weekly missions
  const weeklyExists = await prisma.missaoDiaria.findFirst({
    where: { alunoId, tipo: "semanal", resetToken: weeklyToken },
  })
  if (!weeklyExists) {
    await prisma.missaoDiaria.deleteMany({
      where: { alunoId, tipo: "semanal" },
    })
    await prisma.missaoDiaria.createMany({
      data: semanaisTemplate.map((m) => ({
        alunoId,
        dia: m.dia,
        titulo: m.titulo,
        descricao: m.descricao,
        icone: m.icone,
        tipo: "semanal",
        pontos: m.pontos,
        resetToken: weeklyToken,
      })),
    })
  }
}

async function autoCompleteMissoes(alunoId: string) {
  const missoes = await prisma.missaoDiaria.findMany({
    where: { alunoId },
    orderBy: { dia: "asc" },
  })

  if (missoes.length === 0) return missoes

  const presencasConfirmadas = await prisma.presenca.count({
    where: { alunoId, status: "confirmed" },
  })

  const presencasHoje = await prisma.presenca.count({
    where: { alunoId, status: "confirmed", data: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
  })

  const streak = await prisma.streak.findUnique({ where: { usuarioId: alunoId } })
  const streakCount = streak?.currentStreak ?? 0

  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const presencasSemana = await prisma.presenca.count({
    where: { alunoId, status: "confirmed", data: { gte: startOfWeek } },
  })

  const presencasManha = await prisma.presenca.count({
    where: { alunoId, status: "confirmed", data: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }, horario: { lt: "10:00" } },
  })

  const postagensMural = await prisma.postagemMural.count({ where: { alunoId } })

  const conditions: Record<string, (m: typeof missoes[0]) => boolean> = {
    "onboarding": (m) => {
      const condMap: Record<number, boolean> = {
        1: presencasConfirmadas >= 1,
        3: streakCount >= 3,
        5: presencasSemana >= 5,
      }
      if (m.dia === 7) {
        const outras = missoes.filter((x) => x.tipo === "onboarding" && x.dia !== 7)
        return outras.every((x) => x.concluida)
      }
      return condMap[m.dia] || false
    },
    "diaria": (m) => {
      if (m.dia === 1) return presencasHoje >= 1
      if (m.dia === 2) return presencasManha >= 1
      if (m.dia === 3) return presencasHoje >= 2
      return false
    },
    "semanal": (m) => {
      if (m.dia === 1) return presencasSemana >= 5
      if (m.dia === 2) return streakCount >= 3
      return false
    },
  }

  let updatedIds: string[] = []
  for (const m of missoes) {
    if (m.concluida) continue
    const check = conditions[m.tipo]
    if (check && check(m)) {
      updatedIds.push(m.id)
    }
  }

  if (updatedIds.length > 0) {
    const updated = await prisma.missaoDiaria.findMany({
      where: { id: { in: updatedIds }, alunoId },
    })
    for (const m of updated) {
      await prisma.missaoDiaria.update({
        where: { id: m.id },
        data: { concluida: true },
      })
      // Award points
      if (m.pontos > 0) {
        await prisma.usuario.update({
          where: { id: alunoId },
          data: { pontos: { increment: m.pontos } },
        })
      }
    }
  }

  // Notify for all onboarding complete
  const onboarding = missoes.filter((m) => m.tipo === "onboarding")
  const onboardingComplete = onboarding.every((m) => m.concluida || updatedIds.includes(m.id))
  if (onboardingComplete && onboarding.length > 0) {
    const existing = await prisma.notificacao.findFirst({
      where: { usuarioId: alunoId, tipo: "missoes_completas" },
    })
    if (!existing) {
      await prisma.notificacao.create({
        data: {
          usuarioId: alunoId,
          tipo: "missoes_completas",
          titulo: "🏅 Missões Completas!",
          descricao: "Você completou todas as 7 missões de onboarding! Sua jornada no Jiu-Jitsu começou com tudo!",
          link: "/dashboard/aluno",
        },
      })
    }
  }

  // Notify for daily missions all complete
  const diarias = missoes.filter((m) => m.tipo === "diaria")
  const diariasComplete = diarias.every((m) => m.concluida || updatedIds.includes(m.id))
  if (diariasComplete && diarias.length > 0) {
    const existing = await prisma.notificacao.findFirst({
      where: { usuarioId: alunoId, tipo: "diarias_completas", createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    })
    if (!existing) {
      await prisma.notificacao.create({
        data: {
          usuarioId: alunoId,
          tipo: "diarias_completas",
          titulo: "⭐ Missões Diárias Completas!",
          descricao: "Você completou todas as missões de hoje! Volte amanhã para novas missões.",
          link: "/dashboard/aluno",
        },
      })
    }
  }

  return prisma.missaoDiaria.findMany({
    where: { alunoId },
    orderBy: [{ tipo: "asc" }, { dia: "asc" }],
  })
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "aluno") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    let missoes = await prisma.missaoDiaria.findMany({
      where: { alunoId: session.user.id },
      orderBy: [{ tipo: "asc" }, { dia: "asc" }],
    })

    if (missoes.length === 0) {
      await prisma.missaoDiaria.createMany({
        data: onboardingTemplate.map((m) => ({
          alunoId: session.user.id,
          dia: m.dia,
          titulo: m.titulo,
          descricao: m.descricao,
          icone: m.icone,
          tipo: "onboarding",
        })),
      })
    }

    await ensureCyclicMissions(session.user.id)

    missoes = await autoCompleteMissoes(session.user.id)

    const pontos = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: { pontos: true },
    })

    return NextResponse.json({
      missoes,
      pontos: pontos?.pontos || 0,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "aluno") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { id } = await request.json()

    const missao = await prisma.missaoDiaria.findFirst({
      where: { id, alunoId: session.user.id },
    })

    if (!missao) return NextResponse.json({ error: "Missão não encontrada" }, { status: 404 })

    await prisma.missaoDiaria.update({
      where: { id },
      data: { concluida: true },
    })

    if (missao.pontos > 0) {
      await prisma.usuario.update({
        where: { id: session.user.id },
        data: { pontos: { increment: missao.pontos } },
      })
    }

    const missoes = await autoCompleteMissoes(session.user.id)

    const pontos = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: { pontos: true },
    })

    return NextResponse.json({
      missoes,
      pontos: pontos?.pontos || 0,
    })
  } catch (error) {
    return handleApiError(error)
  }

}
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { missoesUpdateSchema } from "@/lib/validation"
import { notificarUsuario } from "@/lib/notificar"

const onboardingTemplates: Record<string, { dia: number; titulo: string; descricao: string; icone: string }[]> = {
  aluno: [
    { dia: 1, titulo: "Primeiro Check-in", descricao: "Faça seu primeiro check-in na academia", icone: "📍" },
    { dia: 2, titulo: "Conhecendo o Ranking", descricao: "Veja sua posição no ranking da academia", icone: "🏆" },
    { dia: 3, titulo: "Três Dias Seguidos", descricao: "Complete 3 check-ins seguidos", icone: "🔥" },
    { dia: 4, titulo: "Explore o Mural", descricao: "Veja as postagens do mural da academia", icone: "📢" },
    { dia: 5, titulo: "Semana Completa", descricao: "Complete 5 check-ins na semana", icone: "🎯" },
    { dia: 6, titulo: "Compartilhe", descricao: "Compartilhe sua evolução nas redes", icone: "📤" },
    { dia: 7, titulo: "Jornada Iniciada", descricao: "Complete todas as missões da primeira semana!", icone: "🏅" },
  ],
  professor: [
    { dia: 1, titulo: "Criar Primeira Turma", descricao: "Crie sua primeira turma para organizar seus alunos", icone: "📚" },
    { dia: 2, titulo: "Confirmar Primeira Presença", descricao: "Confirme a presença de um aluno no check-in", icone: "✅" },
    { dia: 3, titulo: "Missão Cumprida", descricao: "Complete todas as missões e comece a usar o OssTrack!", icone: "🏅" },
  ],
  dono: [
    { dia: 1, titulo: "Convidar um Professor", descricao: "Convide um professor para sua academia", icone: "👨‍🏫" },
    { dia: 2, titulo: "Configurar Graduações", descricao: "Revise as regras de graduação da sua academia", icone: "🥋" },
    { dia: 3, titulo: "Missão Cumprida", descricao: "Complete todas as missões e acompanhe sua academia!", icone: "🏅" },
  ],
}

const DIARIAS_POOL = [
  { dia: 1, titulo: "Treinar Hoje", descricao: "Faça check-in hoje e mantenha a consistência", icone: "🥋", pontos: 10 },
  { dia: 2, titulo: "Madrugador", descricao: "Faça check-in antes das 10h", icone: "🌅", pontos: 5 },
  { dia: 3, titulo: "Foco Total", descricao: "Complete 2 check-ins no mesmo dia (manhã + tarde)", icone: "🎯", pontos: 15 },
  { dia: 4, titulo: "Compartilhe", descricao: "Compartilhe um post no mural hoje", icone: "📢", pontos: 10 },
  { dia: 5, titulo: "Curtiu?", descricao: "Curta 3 postagens no mural da academia", icone: "❤️", pontos: 5 },
  { dia: 6, titulo: "Convide um Amigo", descricao: "Gere um link de convite para um amigo", icone: "👥", pontos: 15 },
  { dia: 7, titulo: "Fotografe o Treino", descricao: "Registre seu treino com um check-in por QR code", icone: "📸", pontos: 10 },
  { dia: 8, titulo: "Noite de Treino", descricao: "Faça check-in após as 18h", icone: "🌙", pontos: 10 },
  { dia: 9, titulo: "Dobradinha", descricao: "Treine em dois horários diferentes hoje", icone: "💪", pontos: 20 },
  { dia: 10, titulo: "Primeira Faixa", descricao: "Atualize seu perfil hoje", icone: "🥋", pontos: 5 },
]

const SEMANAIS_POOL = [
  { dia: 1, titulo: "Semana Cheia", descricao: "Complete 5 check-ins na semana", icone: "📅", pontos: 25 },
  { dia: 2, titulo: "Raio Contínuo", descricao: "Mantenha streak de 3+ dias durante a semana", icone: "⚡", pontos: 20 },
  { dia: 3, titulo: "Guerreiro de Fim de Semana", descricao: "Treine sábado E domingo", icone: "🌞", pontos: 30 },
  { dia: 4, titulo: "Mestre da Turma", descricao: "Seja o primeiro a fazer check-in em 2 dias", icone: "👑", pontos: 15 },
]

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function getDiariasTemplate(): typeof DIARIAS_POOL {
  return pickRandom(DIARIAS_POOL, 3).map((m, i) => ({ ...m, dia: i + 1 }))
}

function getSemanaisTemplate(): typeof SEMANAIS_POOL {
  return pickRandom(SEMANAIS_POOL, 2).map((m, i) => ({ ...m, dia: i + 1 }))
}

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
      data: getDiariasTemplate().map((m) => ({
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
      data: getSemanaisTemplate().map((m) => ({
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

async function autoCompleteMissoes(usuarioId: string, role: string) {
  const missoes = await prisma.missaoDiaria.findMany({
    where: { alunoId: usuarioId },
    orderBy: { dia: "asc" },
  })

  if (missoes.length === 0) return missoes

  const presencasConfirmadas = await prisma.presenca.count({
    where: { alunoId: usuarioId, status: "confirmed" },
  })

  const presencasHoje = await prisma.presenca.count({
    where: { alunoId: usuarioId, status: "confirmed", data: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
  })

  const streak = await prisma.streak.findUnique({ where: { usuarioId } })
  const streakCount = streak?.currentStreak ?? 0

  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const presencasSemana = await prisma.presenca.count({
    where: { alunoId: usuarioId, status: "confirmed", data: { gte: startOfWeek } },
  })

  const presencasManha = await prisma.presenca.count({
    where: { alunoId: usuarioId, status: "confirmed", data: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }, horario: { lt: "10:00" } },
  })

  const postagensMural = await prisma.postagemMural.count({ where: { alunoId: usuarioId } })

  // Role-specific checks
  const turmasCriadas = role === "professor"
    ? await prisma.turma.count({ where: { professorId: usuarioId } })
    : 0
  const presencasConfirmadasPor = role === "professor"
    ? await prisma.presenca.count({ where: { confirmadoPor: usuarioId } })
    : 0
  const convitesProfessor = role === "dono"
    ? await prisma.convite.count({ where: { remetenteId: usuarioId, tipo: "professor" } })
    : 0
  const graduacoesAcademia = role === "dono"
    ? await prisma.graduacao.count({ where: { academia: { usuarios: { some: { id: usuarioId } } } } })
    : 0

  const conditions: Record<string, (m: typeof missoes[0]) => boolean> = {
    "onboarding": (m) => {
      if (role === "aluno") {
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
      }
      if (role === "professor") {
        if (m.dia === 1) return turmasCriadas >= 1
        if (m.dia === 2) return presencasConfirmadasPor >= 1
        if (m.dia === 3) {
          const outras = missoes.filter((x) => x.tipo === "onboarding" && x.dia !== 3)
          return outras.every((x) => x.concluida)
        }
        return false
      }
      if (role === "dono") {
        if (m.dia === 1) return convitesProfessor >= 1
        if (m.dia === 2) return graduacoesAcademia >= 1
        if (m.dia === 3) {
          const outras = missoes.filter((x) => x.tipo === "onboarding" && x.dia !== 3)
          return outras.every((x) => x.concluida)
        }
        return false
      }
      return false
    },
    "diaria": (m) => {
      if (role !== "aluno") return false
      if (m.dia === 1) return presencasHoje >= 1
      if (m.dia === 2) return presencasManha >= 1
      if (m.dia === 3) return presencasHoje >= 2
      if (m.dia === 4) return postagensMural >= 1
      if (m.dia === 5) return true // curtidas - always auto-completable
      if (m.dia === 6) return true // convites
      if (m.dia === 7) return true // QR check-in
      if (m.dia === 8) return presencasHoje >= 1 && new Date().getHours() >= 18
      if (m.dia === 9) return presencasHoje >= 2
      if (m.dia === 10) return true // perfil update
      return false
    },
    "semanal": (m) => {
      if (role !== "aluno") return false
      if (m.dia === 1) return presencasSemana >= 5
      if (m.dia === 2) return streakCount >= 3
      if (m.dia === 3) return presencasSemana >= 2 && [0, 6].includes(new Date().getDay())
      if (m.dia === 4) return true // first check-in of day
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
    for (const id of updatedIds) {
      const m = missoes.find((x) => x.id === id)
      if (!m) continue
      await prisma.missaoDiaria.update({
        where: { id },
        data: { concluida: true },
      })
      if (m.pontos > 0) {
        await prisma.usuario.update({
          where: { id: usuarioId },
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
      where: { usuarioId, tipo: "missoes_completas" },
    })
    if (!existing) {
      const msg = role === "aluno"
        ? { titulo: "🏅 Missões Completas!", descricao: "Você completou todas as missões de onboarding! Sua jornada no Jiu-Jitsu começou com tudo!", link: "/dashboard/aluno" }
        : role === "professor"
        ? { titulo: "🏅 Professor Ready!", descricao: "Você completou todas as missões! Agora é só gerenciar suas turmas e alunos.", link: "/dashboard/professor" }
        : { titulo: "🏅 Academia no Ar!", descricao: "Você completou todas as missões! Sua academia está pronta para crescer.", link: "/dashboard/dono" }
      await notificarUsuario({
        usuarioId, tipo: "missoes_completas", ...msg,
      })
    }
  }

  // Notify for daily missions all complete (aluno only)
  if (role === "aluno") {
    const diarias = missoes.filter((m) => m.tipo === "diaria")
    const diariasComplete = diarias.every((m) => m.concluida || updatedIds.includes(m.id))
    if (diariasComplete && diarias.length > 0) {
      const existing = await prisma.notificacao.findFirst({
        where: { usuarioId, tipo: "diarias_completas", createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      })
      if (!existing) {
        await notificarUsuario({
          usuarioId,
          tipo: "diarias_completas",
          titulo: "⭐ Missões Diárias Completas!",
          descricao: "Você completou todas as missões de hoje! Volte amanhã para novas missões.",
          link: "/dashboard/aluno",
        })
      }
    }
  }

  return prisma.missaoDiaria.findMany({
    where: { alunoId: usuarioId },
    orderBy: [{ tipo: "asc" }, { dia: "asc" }],
  })
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    let missoes = await prisma.missaoDiaria.findMany({
      where: { alunoId: session.user.id },
      orderBy: [{ tipo: "asc" }, { dia: "asc" }],
    })

    if (missoes.length === 0) {
      const template = onboardingTemplates[session.user.role as keyof typeof onboardingTemplates] || onboardingTemplates.aluno
      await prisma.missaoDiaria.createMany({
        data: template.map((m) => ({
          alunoId: session.user.id,
          dia: m.dia,
          titulo: m.titulo,
          descricao: m.descricao,
          icone: m.icone,
          tipo: "onboarding",
        })),
      })
    }

    if (session.user.role === "aluno") {
      await ensureCyclicMissions(session.user.id)
    }

    missoes = await autoCompleteMissoes(session.user.id, session.user.role)

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
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const body = await request.json()
    const parsed = missoesUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "id é obrigatório" }, { status: 400 })
    }
    const { id } = parsed.data

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

    const missoes = await autoCompleteMissoes(session.user.id, session.user.role)

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
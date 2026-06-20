import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { NIVEL_DISCIPLINA_CONFIG, recalcularNivelDisciplina } from "@/lib/disciplina"
import { notificarUsuario } from "@/lib/notificar"

function getSemanaKey(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return `${monday.getFullYear()}-${monday.getMonth()}-${monday.getDate()}`
}

export async function GET() {
  try {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  let streak = await prisma.streak.findUnique({
    where: { usuarioId: session.user.id },
  })

  if (!streak) {
    streak = await prisma.streak.create({
      data: { usuarioId: session.user.id },
    })
  }

  return NextResponse.json({
    currentStreak: streak.currentStreak,
    bestStreak: streak.bestStreak,
    lastCheckinDate: streak.lastCheckinDate,
    streakFreeze: streak.streakFreeze,
    freezeUsado: streak.freezeUsado,
  })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST() {
  try {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  let streak = await prisma.streak.findUnique({
    where: { usuarioId: session.user.id },
  })

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const semanaKey = getSemanaKey(hoje)

  if (!streak) {
    streak = await prisma.streak.create({
      data: { usuarioId: session.user.id, currentStreak: 1, bestStreak: 1, lastCheckinDate: hoje, semanaFreeze: semanaKey },
    })
  } else {
    const ultimo = streak.lastCheckinDate ? new Date(streak.lastCheckinDate) : null
    ultimo?.setHours(0, 0, 0, 0)

    const diff = ultimo ? Math.floor((hoje.getTime() - ultimo.getTime()) / (1000 * 60 * 60 * 24)) : 999

    let novoStreak = streak.currentStreak
    let usouFreeze = false
    if (diff === 0) {
      return NextResponse.json({
        currentStreak: streak.currentStreak,
        bestStreak: streak.bestStreak,
        lastCheckinDate: streak.lastCheckinDate,
        streakFreeze: streak.streakFreeze,
        freezeUsado: streak.freezeUsado,
      })
    } else if (diff === 1) {
      novoStreak += 1
    } else if (diff > 1) {
      if (streak.streakFreeze > 0 && !streak.freezeUsado) {
        novoStreak = streak.currentStreak + 1
        usouFreeze = true
      } else {
        novoStreak = 1
      }
    }

    const bestStreak = Math.max(streak.bestStreak, novoStreak)

    const semanaDiferente = streak.semanaFreeze !== semanaKey
    const nextFreeze = semanaDiferente ? 1 : streak.streakFreeze
    const nextFreezeUsado = semanaDiferente ? false : (usouFreeze ? true : streak.freezeUsado)

    streak = await prisma.streak.update({
      where: { id: streak.id },
      data: {
        currentStreak: novoStreak,
        bestStreak,
        lastCheckinDate: hoje,
        streakFreeze: nextFreeze,
        freezeUsado: nextFreezeUsado,
        semanaFreeze: semanaKey,
      },
    })

    const nivelAntigo = await prisma.usuario.findUnique({ where: { id: session.user.id }, select: { nivelDisciplina: true } })
    const nivelNovo = await recalcularNivelDisciplina(session.user.id)
    if (nivelNovo && nivelNovo !== nivelAntigo?.nivelDisciplina) {
      const cfg = NIVEL_DISCIPLINA_CONFIG[nivelNovo]
      await notificarUsuario({
        usuarioId: session.user.id,
        tipo: "conquista",
        titulo: `${cfg.icone} Novo Nível de Disciplina!`,
        descricao: `Você alcançou o nível ${cfg.label}! Continue assim para evoluir ainda mais.`,
        link: "/dashboard/aluno/perfil",
      }).catch(() => {})
    }

    if (novoStreak >= 5 && diff > 0) {
      const milestones = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100]
      if (milestones.includes(novoStreak)) {
        const msgs: Record<number, string> = {
          5: "🥉 5 dias seguidos! Você está criando o hábito!",
          10: "🥈 10 dias de streak! Disciplina é o que te leva longe!",
          15: "🔥 15 dias! O tatame já sente sua falta quando você não vem!",
          20: "⚡ 20 dias! Virou rotina, virou estilo de vida!",
          25: "💪 25 dias! A consistência está te transformando!",
          30: "🏆 30 DIAS DE STREAK! Você é uma máquina!",
          40: "👑 40 dias! Lenda viva!",
          50: "🔥🔥 50 DIAS! Meio caminho andado pra faixa preta!",
          60: "⚡⚡ 60 DIAS! Ninguém para você!",
          75: "💀 75 DIAS! Besta-fera do tatame!",
          100: "🎯🎯🎯 100 DIAS! VOCÊ É O MESTRE DOS MESTRES!",
        }
        await notificarUsuario({
          usuarioId: session.user.id,
          tipo: "conquista",
          titulo: `🔥 Streak de ${novoStreak} dias!`,
          descricao: msgs[novoStreak] || `🔥 Incrível! Você já tem ${novoStreak} dias de streak!`,
          link: "/dashboard/aluno/evolucao",
        }).catch(() => {})
      }
    }
  }

  return NextResponse.json({
    currentStreak: streak.currentStreak,
    bestStreak: streak.bestStreak,
    lastCheckinDate: streak.lastCheckinDate,
    streakFreeze: streak.streakFreeze,
    freezeUsado: streak.freezeUsado,
  })
  } catch (error) {
    return handleApiError(error)
  }
}

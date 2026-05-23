import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
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
  })
}

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  let streak = await prisma.streak.findUnique({
    where: { usuarioId: session.user.id },
  })

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  if (!streak) {
    streak = await prisma.streak.create({
      data: { usuarioId: session.user.id, currentStreak: 1, bestStreak: 1, lastCheckinDate: hoje },
    })
  } else {
    const ultimo = streak.lastCheckinDate ? new Date(streak.lastCheckinDate) : null
    ultimo?.setHours(0, 0, 0, 0)

    const diff = ultimo ? Math.floor((hoje.getTime() - ultimo.getTime()) / (1000 * 60 * 60 * 24)) : 999

    let novoStreak = streak.currentStreak
    if (diff === 1) {
      novoStreak += 1
    } else if (diff > 1) {
      novoStreak = 1
    }

    const bestStreak = Math.max(streak.bestStreak, novoStreak)

    streak = await prisma.streak.update({
      where: { id: streak.id },
      data: { currentStreak: novoStreak, bestStreak, lastCheckinDate: hoje },
    })
  }

  return NextResponse.json({
    currentStreak: streak.currentStreak,
    bestStreak: streak.bestStreak,
    lastCheckinDate: streak.lastCheckinDate,
  })
}

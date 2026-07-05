import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { notificarUsuario } from "@/lib/notificar"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const streak = await prisma.streak.findUnique({
      where: { usuarioId: session.user.id },
    })

    if (!streak || streak.currentStreak >= 3) {
      return NextResponse.json({ error: "Streak não precisa ser salvo" }, { status: 400 })
    }

    const user = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: { pontos: true },
    })

    const custoXp = 100
    if (!user || user.pontos < custoXp) {
      return NextResponse.json({ error: `Você precisa de ${custoXp} XP para restaurar o streak` }, { status: 400 })
    }

    await prisma.usuario.update({
      where: { id: session.user.id },
      data: { pontos: { decrement: custoXp } },
    })

    await prisma.streak.update({
      where: { id: streak.id },
      data: { currentStreak: 3, bestStreak: Math.max(streak.bestStreak, 3) },
    })

    await notificarUsuario({
      usuarioId: session.user.id,
      tipo: "sistema",
      titulo: "Streak restaurado! 🔥",
      descricao: `Usou ${custoXp} XP para restaurar seu streak para 3 dias. Não perca de novo!`,
      link: "/dashboard/aluno",
    })

    return NextResponse.json({ currentStreak: 3, xpGasto: custoXp })
  } catch (error) {
    return handleApiError(error)
  }
}
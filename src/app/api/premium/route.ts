import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const sub = await prisma.premiumSubscription.findUnique({
      where: { usuarioId: session.user.id },
    })

    const expirado = sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd) < new Date() : false
    const isPremium = sub?.status === "active" && !expirado
    const plano = isPremium ? sub?.plan || "premium" : "free"

    return NextResponse.json({
      plano,
      isPremium,
      dataInicio: sub?.currentPeriodStart ?? null,
      dataExpiracao: sub?.currentPeriodEnd ?? null,
      diasRestantes: sub?.currentPeriodEnd
        ? Math.max(0, Math.floor((new Date(sub.currentPeriodEnd).getTime() - Date.now()) / 86400000))
        : 0,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const sub = await prisma.premiumSubscription.findUnique({
      where: { usuarioId: session.user.id },
    })

    return NextResponse.json({
      active: sub?.status === "active",
      plan: sub?.plan || null,
      status: sub?.status || "inactive",
      currentPeriodEnd: sub?.currentPeriodEnd,
      cancelAtPeriodEnd: sub?.cancelAtPeriodEnd || false,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

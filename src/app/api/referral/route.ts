import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const convites = await prisma.convite.findMany({
      where: { remetenteId: session.user.id },
      select: { id: true, tipo: true, usado: true, createdAt: true },
    })

    const totalEnviados = convites.length
    const totalUsados = convites.filter((c) => c.usado).length

    // Badge baseado no número de indicações
    let badge = null
    if (totalUsados >= 10) badge = { nome: "Mestre Indicador", icone: "👑", cor: "#c9a84c" }
    else if (totalUsados >= 5) badge = { nome: "Divulgador Pro", icone: "🔥", cor: "#f59e0b" }
    else if (totalUsados >= 3) badge = { nome: "Embaixador", icone: "⭐", cor: "#8b5cf6" }
    else if (totalUsados >= 1) badge = { nome: "Primeira Indicação", icone: "🎯", cor: "#10b981" }

    return NextResponse.json({
      totalEnviados,
      totalUsados,
      badge,
      convites: convites.slice(-10), // últimos 10
    })
  } catch (error) {
    return handleApiError(error)
  }
}

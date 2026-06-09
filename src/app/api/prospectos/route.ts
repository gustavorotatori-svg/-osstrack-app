import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET() {
  try {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const convites = await prisma.convite.findMany({
    where: { academiaId: session.user.academiaId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const total = convites.length
  const usados = convites.filter((c) => c.usado).length
  const pendentes = total - usados
  const expirados = convites.filter((c) => c.expiresAt && c.expiresAt < new Date() && !c.usado).length

  const porTipo = await prisma.convite.groupBy({
    by: ["tipo"],
    where: { academiaId: session.user.academiaId },
    _count: true,
  })

  const ultimos = convites.slice(0, 10).map((c) => ({
    id: c.id,
    tipo: c.tipo,
    codigo: c.codigo,
    usado: c.usado,
    createdAt: c.createdAt.toISOString(),
    expiresAt: c.expiresAt?.toISOString() || null,
  }))

  const conversao = total > 0 ? Math.round((usados / total) * 100) : 0

  return NextResponse.json({
    stats: { total, usados, pendentes, expirados, conversao },
    porTipo: porTipo.map((p) => ({ tipo: p.tipo, total: p._count })),
    ultimos,
  })
  } catch (error) {
    return handleApiError(error)
  }
}

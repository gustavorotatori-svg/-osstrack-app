import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: { plano: true, planoInicio: true, planoExpiracao: true },
    })

    if (!usuario) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    const isPremium = usuario.plano === "premium" || usuario.plano === "trial"
    const expirado = usuario.planoExpiracao ? new Date(usuario.planoExpiracao) < new Date() : false

    return NextResponse.json({
      plano: usuario.plano,
      isPremium: isPremium && !expirado,
      dataInicio: usuario.planoInicio,
      dataExpiracao: usuario.planoExpiracao,
      diasRestantes: usuario.planoExpiracao
        ? Math.max(0, Math.floor((new Date(usuario.planoExpiracao).getTime() - Date.now()) / 86400000))
        : 0,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
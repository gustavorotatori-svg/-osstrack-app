import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const academia = await prisma.academia.findUnique({
      where: { id: session.user.academiaId },
    })

    if (!academia) return NextResponse.json({ error: "Academia não encontrada" }, { status: 404 })

    return NextResponse.json(academia)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "dono") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { nome, whatsapp, pixKey, raio, horarioInicio, horarioFim, wellhubAtivo, wellhubToken, wellhubGymId } = body

    const academia = await prisma.academia.update({
      where: { id: session.user.academiaId },
      data: {
        ...(nome !== undefined && { nome }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(pixKey !== undefined && { pixKey }),
        ...(raio !== undefined && { raio }),
        ...(horarioInicio !== undefined && { horarioInicio }),
        ...(horarioFim !== undefined && { horarioFim }),
        ...(wellhubAtivo !== undefined && { wellhubAtivo }),
        ...(wellhubToken !== undefined && { wellhubToken }),
        ...(wellhubGymId !== undefined && { wellhubGymId }),
      },
    })

    return NextResponse.json(academia)
  } catch (error) {
    return handleApiError(error)
  }
}

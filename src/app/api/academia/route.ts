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

    // Validate input types
    const data: Record<string, unknown> = {}
    if (nome !== undefined && typeof nome === "string" && nome.length > 0 && nome.length <= 120) data.nome = nome
    if (whatsapp !== undefined && (whatsapp === null || (typeof whatsapp === "string" && whatsapp.length <= 20))) data.whatsapp = whatsapp
    if (pixKey !== undefined && (pixKey === null || (typeof pixKey === "string" && pixKey.length <= 100))) data.pixKey = pixKey
    if (raio !== undefined && typeof raio === "number" && raio >= 50 && raio <= 5000) data.raio = raio
    if (horarioInicio !== undefined && (horarioInicio === null || (typeof horarioInicio === "string" && horarioInicio.length <= 5))) data.horarioInicio = horarioInicio
    if (horarioFim !== undefined && (horarioFim === null || (typeof horarioFim === "string" && horarioFim.length <= 5))) data.horarioFim = horarioFim
    if (wellhubAtivo !== undefined && typeof wellhubAtivo === "boolean") data.wellhubAtivo = wellhubAtivo
    if (wellhubToken !== undefined && (wellhubToken === null || (typeof wellhubToken === "string" && wellhubToken.length <= 500))) data.wellhubToken = wellhubToken
    if (wellhubGymId !== undefined && (wellhubGymId === null || (typeof wellhubGymId === "string" && wellhubGymId.length <= 50))) data.wellhubGymId = wellhubGymId

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nenhum dado válido para atualizar" }, { status: 400 })
    }

    const academia = await prisma.academia.update({
      where: { id: session.user.academiaId },
      data,
    })

    return NextResponse.json(academia)
  } catch (error) {
    return handleApiError(error)
  }
}

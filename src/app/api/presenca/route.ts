import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { haversineDistance } from "@/lib/geo"
import { handleApiError } from "@/lib/api-error"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "aluno") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { latitude, longitude } = await request.json()
    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Localização obrigatória. Ative o GPS para fazer check-in." }, { status: 400 })
    }

    const academia = session.user.academiaId
      ? await prisma.academia.findUnique({
          where: { id: session.user.academiaId },
          select: { lat: true, lng: true, raio: true, nome: true },
        })
      : null

    if (academia && academia.lat && academia.lng) {
      const distancia = haversineDistance(
        latitude, longitude,
        academia.lat, academia.lng
      )
      if (distancia > academia.raio) {
        return NextResponse.json({
          error: `Você está a ${Math.round(distancia)}m da academia (limite: ${academia.raio}m). Faça check-in estando na academia.`,
          distancia: Math.round(distancia),
          limite: academia.raio,
        }, { status: 403 })
      }
    }

    const now = new Date()
    const horario = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

    const presenca = await prisma.presenca.create({
      data: {
        alunoId: session.user.id,
        data: now,
        horario,
        status: "pendente",
        observacao: `${latitude},${longitude}`,
      },
    })

    return NextResponse.json({ success: true, id: presenca.id, academia: academia?.nome || null })
  } catch (error) {
    return handleApiError(error)
  }
}
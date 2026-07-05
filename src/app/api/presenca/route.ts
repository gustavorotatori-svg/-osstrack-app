import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { haversineDistance } from "@/lib/geo"
import { handleApiError } from "@/lib/api-error"
import { presencaSchema } from "@/lib/validation"
import { notificarUsuario } from "@/lib/notificar"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "aluno") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const body = await request.json()
    const parsed = presencaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Localização obrigatória. Ative o GPS para fazer check-in." }, { status: 400 })
    }
    const { latitude, longitude } = parsed.data

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

    // Notify professor + dono that aluno checked in
    const professores = await prisma.usuario.findMany({
      where: {
        academiaId: session.user.academiaId,
        role: { in: ["professor", "dono"] },
      },
      select: { id: true, role: true },
    })
    for (const p of professores) {
      await notificarUsuario({
        usuarioId: p.id,
        tipo: "presenca",
        titulo: "Check-in recebido",
        descricao: `${session.user.name} fez check-in na academia`,
        link: `/dashboard/${p.role === "dono" ? "dono" : "professor"}/presencas`,
      }).catch(() => {})
    }

    return NextResponse.json({ success: true, id: presenca.id, academia: academia?.nome || null })
  } catch (error) {
    return handleApiError(error)
  }
}
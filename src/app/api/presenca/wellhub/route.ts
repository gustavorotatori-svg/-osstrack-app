import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { notificarUsuario } from "@/lib/notificar"

const WELLHUB_API = "https://api.partners.gympass.com/access/v1/validate"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["dono", "professor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const academia = await prisma.academia.findUnique({
      where: { id: session.user.academiaId },
      select: {
        wellhubAtivo: true,
        wellhubToken: true,
        wellhubGymId: true,
        nome: true,
      },
    })

    if (!academia?.wellhubAtivo) {
      return NextResponse.json({ error: "Wellhub não está ativo nesta academia" }, { status: 400 })
    }

    if (!academia.wellhubToken || !academia.wellhubGymId) {
      return NextResponse.json({ error: "Configure o Token e Gym ID do Wellhub nas configurações da academia" }, { status: 400 })
    }

    const { wellhubId, skipValidation } = await request.json()
    if (!wellhubId) {
      return NextResponse.json({ error: "ID do Wellhub (gympass_id) obrigatório" }, { status: 400 })
    }

    if (!skipValidation) {
      const wellhubRes = await fetch(WELLHUB_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${academia.wellhubToken}`,
          "X-Gym-Id": academia.wellhubGymId,
        },
        body: JSON.stringify({ gympass_id: wellhubId }),
      })

      if (!wellhubRes.ok) {
        const text = await wellhubRes.text()
        console.error("Wellhub API error:", wellhubRes.status, text)

        if (wellhubRes.status === 404) {
          return NextResponse.json({ error: "Check-in não encontrado no Wellhub. O aluno precisa fazer check-in no app do Wellhub primeiro." }, { status: 404 })
        }
        if (wellhubRes.status === 400) {
          return NextResponse.json({ error: "Check-in inválido ou já expirado no Wellhub" }, { status: 400 })
        }

        return NextResponse.json({ error: `Erro na API do Wellhub: ${wellhubRes.status}` }, { status: 502 })
      }
    }

    const aluno = await prisma.usuario.findFirst({
      where: { wellhubId, academiaId: session.user.academiaId },
      select: { id: true, nome: true },
    })

    if (!aluno) {
      return NextResponse.json({
        error: "WELLHUB_ID_NOT_ASSOCIATED",
        message: "Check-in validado no Wellhub! Mas este ID não está associado a nenhum aluno. Registre o Wellhub ID no perfil do aluno.",
        wellhubId,
      }, { status: 404 })
    }

    const now = new Date()
    const horario = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

    const presenca = await prisma.presenca.create({
      data: {
        alunoId: aluno.id,
        data: now,
        horario,
        status: "confirmed",
        confirmadoPor: session.user.id,
        origem: "wellhub",
      },
    })

    await notificarUsuario({
      usuarioId: aluno.id,
      tipo: "presenca",
      titulo: "Check-in Wellhub!",
      descricao: `Seu check-in via Wellhub foi registrado (${horario})`,
      link: "/dashboard/aluno",
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      id: presenca.id,
      alunoNome: aluno.nome,
      horario,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { awardXp } from "@/lib/gamification"
import { notificarUsuario } from "@/lib/notificar"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["dono", "professor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { presencaId, userId, alunoId } = await request.json()

    // busca por userId (do QR code) — acha presença pendente mais recente
    const targetId = userId || alunoId
    if (targetId) {
      const presenca = await prisma.presenca.findFirst({
        where: { alunoId: targetId, status: "pendente" },
        orderBy: { createdAt: "desc" },
        include: { aluno: { select: { id: true, nome: true, academiaId: true } } },
      })

      if (!presenca) {
        return NextResponse.json({ error: "Nenhuma presença pendente encontrada para este aluno" }, { status: 404 })
      }

      // Cross-academia check
      if (presenca.aluno.academiaId !== session.user.academiaId) {
        return NextResponse.json({ error: "Aluno não pertence à sua academia" }, { status: 403 })
      }

      await prisma.presenca.update({
        where: { id: presenca.id },
        data: { status: "confirmed", confirmadoPor: session.user.id },
      })

      await notificarUsuario({
        usuarioId: presenca.alunoId,
        tipo: "presenca",
        titulo: "Presença confirmada!",
        descricao: `Sua presença de ${presenca.horario} foi confirmada por ${session.user.name}`,
        link: "/dashboard/aluno",
      })

      await awardXp(presenca.alunoId, 15)

      return NextResponse.json({ success: true, alunoNome: presenca.aluno.nome, horario: presenca.horario })
    }

    // busca por presencaId direta
    if (!presencaId) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const presenca = await prisma.presenca.findUnique({
      where: { id: presencaId },
      include: { aluno: { select: { id: true, nome: true, academiaId: true } } },
    })

    if (!presenca) return NextResponse.json({ error: "Presença não encontrada" }, { status: 404 })

    // Cross-academia check
    if (presenca.aluno.academiaId !== session.user.academiaId) {
      return NextResponse.json({ error: "Aluno não pertence à sua academia" }, { status: 403 })
    }

    await prisma.presenca.update({
      where: { id: presencaId },
      data: { status: "confirmed", confirmadoPor: session.user.id },
    })

    await notificarUsuario({
      usuarioId: presenca.alunoId,
      tipo: "presenca",
      titulo: "Presença confirmada!",
      descricao: `Sua presença de ${presenca.horario} foi confirmada por ${session.user.name}`,
      link: "/dashboard/aluno",
    })

    await awardXp(presenca.alunoId, 15)

    return NextResponse.json({ success: true, alunoNome: presenca.aluno.nome, horario: presenca.horario })
  } catch (error) {
    return handleApiError(error)
  }
}
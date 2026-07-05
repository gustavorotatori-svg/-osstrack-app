import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { notificarUsuario } from "@/lib/notificar"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["dono", "professor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { alunoId } = await request.json()
    if (!alunoId) return NextResponse.json({ error: "alunoId obrigatório" }, { status: 400 })

    const aluno = await prisma.usuario.findUnique({
      where: { id: alunoId },
      select: { id: true, academiaId: true },
    })
    if (!aluno || aluno.academiaId !== session.user.academiaId) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
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
      },
    })

    await notificarUsuario({
      usuarioId: aluno.id,
      tipo: "presenca",
      titulo: "Presenca registrada!",
      descricao: `Sua presenca de hoje (${horario}) foi registrada por ${session.user.name}`,
      link: "/dashboard/aluno",
    }).catch(() => {})

    return NextResponse.json({ success: true, id: presenca.id })
  } catch (error) {
    return handleApiError(error)
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { notificarUsuario } from "@/lib/notificar"
import { presencaManualSchema } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["dono", "professor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = presencaManualSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "alunoId obrigatório" }, { status: 400 })
    }
    const { alunoId, origem, data: dataRetroativa } = parsed.data

    const aluno = await prisma.usuario.findUnique({
      where: { id: alunoId },
      select: { id: true, academiaId: true },
    })
    if (!aluno || aluno.academiaId !== session.user.academiaId) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
    }

    let dataPresenca: Date
    let horario: string
    if (dataRetroativa) {
      const d = new Date(dataRetroativa)
      const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      if (d < seteDiasAtras) {
        return NextResponse.json({ error: "Só é possível registrar presenças dos últimos 7 dias" }, { status: 400 })
      }
      dataPresenca = d
      horario = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    } else {
      dataPresenca = new Date()
      horario = dataPresenca.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    }

    const presenca = await prisma.presenca.create({
      data: {
        alunoId: aluno.id,
        data: dataPresenca,
        horario,
        status: "confirmed",
        confirmadoPor: session.user.id,
        origem: origem || "app",
      },
    })

    await notificarUsuario({
      usuarioId: aluno.id,
      tipo: "presenca",
      titulo: "Presença registrada!",
      descricao: dataRetroativa
        ? `Sua presença de ${dataPresenca.toLocaleDateString("pt-BR")} foi registrada por ${session.user.name}`
        : `Sua presença de hoje (${horario}) foi registrada por ${session.user.name}`,
      link: "/dashboard/aluno",
    }).catch(() => {})

    return NextResponse.json({ success: true, id: presenca.id })
  } catch (error) {
    return handleApiError(error)
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { notificacaoId, aceitar } = await req.json()
  if (!notificacaoId) {
    return NextResponse.json({ error: "notificacaoId obrigatório" }, { status: 400 })
  }

  const notificacao = await prisma.notificacao.findUnique({
    where: { id: notificacaoId },
  })

  if (!notificacao || notificacao.usuarioId !== session.user.id) {
    return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 })
  }

  // Extract professor name from notification description
  const match = notificacao.descricao.match(/^O professor (.+?) \(/)
  if (!match) {
    return NextResponse.json({ error: "Não foi possível identificar o professor" }, { status: 400 })
  }

  const professorNome = match[1]
  const professor = await prisma.usuario.findFirst({
    where: { nome: professorNome, role: "professor" },
  })

  if (!professor) {
    return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 })
  }

  await prisma.notificacao.update({
    where: { id: notificacaoId },
    data: { lida: true },
  })

  if (aceitar) {
    await prisma.usuario.update({
      where: { id: professor.id },
      data: { academiaId: session.user.academiaId },
    })

    await prisma.notificacao.create({
      data: {
        usuarioId: professor.id,
        tipo: "vinculo_aceito",
        titulo: "Vínculo aceito!",
        descricao: `Sua solicitação foi aceita! Agora você faz parte da academia como professor.`,
        link: "/dashboard/professor",
      },
    })

    return NextResponse.json({ success: true, message: "Professor vinculado à academia!" })
  }

  await prisma.notificacao.create({
    data: {
      usuarioId: professor.id,
      tipo: "vinculo_recusado",
      titulo: "Vínculo recusado",
      descricao: `Infelizmente sua solicitação de vínculo foi recusada pela academia.`,
      link: "/dashboard/professor",
    },
  })

  return NextResponse.json({ success: true, message: "Solicitação recusada." })
}

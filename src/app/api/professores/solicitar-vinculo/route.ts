import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "professor") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { academiaId } = await req.json()
  if (!academiaId) {
    return NextResponse.json({ error: "academiaId obrigatório" }, { status: 400 })
  }

  const academia = await prisma.academia.findUnique({
    where: { id: academiaId },
    include: { usuarios: { where: { role: "dono" }, take: 1 } },
  })

  if (!academia) {
    return NextResponse.json({ error: "Academia não encontrada" }, { status: 404 })
  }

  const dono = academia.usuarios[0]
  if (!dono) {
    return NextResponse.json({ error: "Academia sem dono cadastrado" }, { status: 400 })
  }

  const professor = await prisma.usuario.findUnique({ where: { id: session.user.id } })

  await prisma.notificacao.create({
    data: {
      usuarioId: dono.id,
      tipo: "solicitacao_professor",
      titulo: "Solicitação de Professor",
      descricao: `O professor ${professor?.nome} (id:${professor?.id}) solicita vincular-se à sua academia.`,
      link: "/dashboard/dono",
    },
  })

  return NextResponse.json({ success: true, message: "Solicitação enviada ao dono da academia!" })
}

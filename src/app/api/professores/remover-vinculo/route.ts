import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { vinculoProfessorSchema } from "@/lib/validation"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "dono") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = vinculoProfessorSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "professorId obrigatório" }, { status: 400 })
    }
    const { professorId } = parsed.data

    const professor = await prisma.usuario.findUnique({ where: { id: professorId } })
    if (!professor || professor.role !== "professor" || professor.academiaId !== session.user.academiaId) {
      return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 })
    }

    await prisma.usuario.update({
      where: { id: professorId },
      data: { academiaId: null },
    })

    await prisma.notificacao.create({
      data: {
        usuarioId: professorId,
        tipo: "vinculo_removido",
        titulo: "Vínculo removido",
        descricao: `Seu vínculo com a academia foi removido pelo dono.`,
        link: "/dashboard",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}

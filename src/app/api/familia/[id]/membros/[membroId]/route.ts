import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; membroId: string }> }) {
  try {
    const { id, membroId } = await params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "dono") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const familia = await prisma.familia.findUnique({ where: { id } })
    if (!familia || familia.academiaId !== session.user.academiaId) {
      return NextResponse.json({ error: "Família não encontrada" }, { status: 404 })
    }

    const membro = await prisma.familiaMembro.findUnique({
      where: { id: membroId },
    })
    if (!membro || membro.familiaId !== id) {
      return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 })
    }

    await prisma.familiaMembro.delete({ where: { id: membroId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}

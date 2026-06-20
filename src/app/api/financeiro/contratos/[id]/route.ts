import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || !["dono", "professor"].includes(session.user.role) || !session.user.academiaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { status, valor } = body

  const contrato = await prisma.contrato.findFirst({
    where: { id, academiaId: session.user.academiaId },
  })
  if (!contrato) {
    return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 })
  }

  const updated = await prisma.contrato.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(valor != null && { valor: Math.round(valor * 100) }),
    },
    include: {
      aluno: { select: { id: true, nome: true } },
      plano: { select: { id: true, nome: true, valor: true } },
    },
  })

  return NextResponse.json(updated)
  } catch (error) {
    return handleApiError(error)
  }

}
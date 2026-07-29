import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { contratoUpdateSchema } from "@/lib/validation"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || !["dono", "professor"].includes(session.user.role) || !session.user.academiaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = contratoUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos" }, { status: 400 })
  }
  const { status, valor } = parsed.data

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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || !["dono", "professor"].includes(session.user.role) || !session.user.academiaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const contrato = await prisma.contrato.findFirst({
    where: { id, academiaId: session.user.academiaId },
  })
  if (!contrato) {
    return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 })
  }

  await prisma.contrato.delete({ where: { id } })
  return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
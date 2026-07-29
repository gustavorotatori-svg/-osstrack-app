import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { planoUpdateSchema } from "@/lib/validation"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || !["dono", "professor"].includes(session.user.role) || !session.user.academiaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = planoUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos" }, { status: 400 })
  }
  const { nome, valor, taxaMatricula, descricao, periodo, ativo } = parsed.data

  const plano = await prisma.planoMensalidade.findFirst({
    where: { id, academiaId: session.user.academiaId },
  })
  if (!plano) {
    return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 })
  }

  const updated = await prisma.planoMensalidade.update({
    where: { id },
    data: {
      ...(nome !== undefined && { nome }),
      ...(valor !== undefined && { valor: Math.round(valor * 100) }),
      ...(taxaMatricula !== undefined && { taxaMatricula: Math.round(taxaMatricula * 100) }),
      ...(descricao !== undefined && { descricao }),
      ...(periodo !== undefined && { periodo }),
      ...(ativo !== undefined && { ativo }),
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

  const plano = await prisma.planoMensalidade.findFirst({
    where: { id, academiaId: session.user.academiaId },
  })
  if (!plano) {
    return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 })
  }

  await prisma.planoMensalidade.delete({ where: { id } })
  return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }

}
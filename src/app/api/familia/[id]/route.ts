import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { familiaUpdateSchema } from "@/lib/validation"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const familia = await prisma.familia.findUnique({
      where: { id },
      include: {
        membros: {
          include: {
            aluno: { select: { id: true, nome: true, faixa: true, grau: true } },
          },
        },
      },
    })

    if (!familia || familia.academiaId !== session.user.academiaId) {
      return NextResponse.json({ error: "Família não encontrada" }, { status: 404 })
    }

    return NextResponse.json(familia)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "dono") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const familia = await prisma.familia.findUnique({ where: { id } })
    if (!familia || familia.academiaId !== session.user.academiaId) {
      return NextResponse.json({ error: "Família não encontrada" }, { status: 404 })
    }

    const body = await request.json()
    const parsed = familiaUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos" }, { status: 400 })
    }

    const updated = await prisma.familia.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "dono") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const familia = await prisma.familia.findUnique({ where: { id } })
    if (!familia || familia.academiaId !== session.user.academiaId) {
      return NextResponse.json({ error: "Família não encontrada" }, { status: 404 })
    }

    await prisma.familia.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}

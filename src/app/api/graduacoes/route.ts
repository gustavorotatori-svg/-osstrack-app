import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { graduacaoCreateSchema, graduacaoUpdateSchema } from "@/lib/validation"

export async function GET() {
  try {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const graduacoes = await prisma.graduacao.findMany({
    where: { academiaId: session.user.academiaId },
    orderBy: { aulasProxFx: "asc" },
  })

  return NextResponse.json(graduacoes)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
  const session = await getServerSession(authOptions)
  if (!session || !["dono", "professor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = graduacaoCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "faixa, graus e aulasPorGrau são obrigatórios" }, { status: 400 })
  }
  const { faixa, categoria, graus, aulasPorGrau, aulasProxFx } = parsed.data

  const graduacao = await prisma.graduacao.create({
    data: {
      academiaId: session.user.academiaId,
      faixa,
      categoria,
      graus,
      aulasPorGrau,
      aulasProxFx: aulasProxFx || null,
    },
  })

  return NextResponse.json(graduacao, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: Request) {
  try {
  const session = await getServerSession(authOptions)
  if (!session || !["dono", "professor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = graduacaoUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "id é obrigatório" }, { status: 400 })
  }
  const { id, ...updateData } = parsed.data as any

  if (!id) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 })
  Object.keys(updateData).forEach((key: string) => updateData[key] === undefined && delete updateData[key])

  const graduacao = await prisma.graduacao.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json(graduacao)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: Request) {
  try {
  const session = await getServerSession(authOptions)
  if (!session || !["dono", "professor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const body = await request.json()
  if (!body.id || typeof body.id !== "string") return NextResponse.json({ error: "id é obrigatório" }, { status: 400 })
  const { id } = body

  await prisma.graduacao.delete({ where: { id } })
  return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
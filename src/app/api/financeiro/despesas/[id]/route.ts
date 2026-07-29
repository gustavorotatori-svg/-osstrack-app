import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { despesaUpdateSchema } from "@/lib/validation"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session || !["dono", "professor"].includes(session.user.role) || !session.user.academiaId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = despesaUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos" }, { status: 400 })
    }
    const despesaData = parsed.data
    const despesa = await prisma.despesa.findFirst({
      where: { id, academiaId: session.user.academiaId },
    })
    if (!despesa) {
      return NextResponse.json({ error: "Despesa não encontrada" }, { status: 404 })
    }

    const updateData: any = {}

    if (body.status === "pago") {
      updateData.status = "pago"
      updateData.dataPagamento = body.dataPagamento ? new Date(body.dataPagamento) : new Date()
      updateData.pagoEm = session.user.id
    } else if (body.status === "cancelado") {
      updateData.status = "cancelado"
      updateData.dataPagamento = null
      updateData.pagoEm = null
    } else if (body.status === "pendente") {
      updateData.status = "pendente"
      updateData.dataPagamento = null
      updateData.pagoEm = null
    }

    if (body.descricao !== undefined) updateData.descricao = body.descricao
    if (body.valor !== undefined) updateData.valor = Math.round(Number(body.valor))
    if (body.categoria !== undefined) updateData.categoria = body.categoria
    if (body.observacao !== undefined) updateData.observacao = body.observacao
    if (body.dataVencimento !== undefined) updateData.dataVencimento = new Date(body.dataVencimento)

    const updated = await prisma.despesa.update({
      where: { id },
      data: updateData,
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

    const despesa = await prisma.despesa.findFirst({
      where: { id, academiaId: session.user.academiaId },
    })
    if (!despesa) {
      return NextResponse.json({ error: "Despesa não encontrada" }, { status: 404 })
    }

    await prisma.despesa.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}

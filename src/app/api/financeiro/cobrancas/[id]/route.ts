import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { cobrancaUpdateSchema } from "@/lib/validation"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || !["dono", "professor"].includes(session.user.role) || !session.user.academiaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = cobrancaUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos" }, { status: 400 })
  }
  const { status, metodo, dataPagamento } = parsed.data

  const cobranca = await prisma.cobranca.findFirst({
    where: { id, academiaId: session.user.academiaId },
  })
  if (!cobranca) {
    return NextResponse.json({ error: "Cobrança não encontrada" }, { status: 404 })
  }

  const updateData: any = {}
  if (status === "pago") {
    updateData.status = "pago"
    updateData.metodo = metodo || "dinheiro"
    updateData.dataPagamento = dataPagamento ? new Date(dataPagamento) : new Date()
    updateData.pagoEm = session.user.id
  } else if (status === "cancelado") {
    updateData.status = "cancelado"
    updateData.dataPagamento = null
    updateData.metodo = null
    updateData.pagoEm = null
  } else if (status === "pendente") {
    updateData.status = "pendente"
    updateData.dataPagamento = null
  }

  const updated = await prisma.cobranca.update({
    where: { id },
    data: updateData,
    include: {
      aluno: { select: { id: true, nome: true } },
      contrato: { select: { id: true, plano: { select: { nome: true } } } },
    },
  })

  return NextResponse.json(updated)
  } catch (error) {
    return handleApiError(error)
  }

}
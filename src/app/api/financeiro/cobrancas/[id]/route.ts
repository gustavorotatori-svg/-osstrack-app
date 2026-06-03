import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono" || !session.user.academiaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { status, metodo, dataPagamento } = body

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
}

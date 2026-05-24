import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const where: any = { academiaId: session.user.academiaId }
  if (session.user.role === "aluno") where.alunoId = session.user.id

  const contratos = await prisma.contrato.findMany({
    where,
    include: { aluno: { select: { id: true, nome: true, faixa: true } }, plano: { select: { id: true, nome: true, valor: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(contratos)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { alunoId, planoId, valor, diaVencimento, dataInicio } = await req.json()
  if (!alunoId || !planoId) return NextResponse.json({ error: "alunoId e planoId obrigatórios" }, { status: 400 })

  const contrato = await prisma.contrato.create({
    data: {
      academiaId: session.user.academiaId, alunoId, planoId,
      valor: Number(valor), diaVencimento: diaVencimento || 5,
      dataInicio: dataInicio ? new Date(dataInicio) : new Date(),
    },
  })

  return NextResponse.json(contrato, { status: 201 })
}

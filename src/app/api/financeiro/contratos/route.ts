import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono" || !session.user.academiaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const contratos = await prisma.contrato.findMany({
    where: { academiaId: session.user.academiaId },
    include: {
      aluno: { select: { id: true, nome: true, faixa: true, grau: true, avatar: true } },
      plano: { select: { id: true, nome: true, valor: true, periodo: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(contratos)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono" || !session.user.academiaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { alunoId, planoId, valor, dataInicio, dataFim } = body

  if (!alunoId || !planoId) {
    return NextResponse.json({ error: "alunoId e planoId são obrigatórios" }, { status: 400 })
  }

  const aluno = await prisma.usuario.findFirst({
    where: { id: alunoId, academiaId: session.user.academiaId, role: "aluno" },
  })
  if (!aluno) {
    return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
  }

  const exists = await prisma.contrato.findFirst({
    where: { alunoId, academiaId: session.user.academiaId, status: { in: ["ativo", "inadimplente"] } },
  })
  if (exists) {
    return NextResponse.json({ error: "Aluno já possui um contrato ativo" }, { status: 400 })
  }

  const contrato = await prisma.contrato.create({
    data: {
      alunoId,
      academiaId: session.user.academiaId,
      planoId,
      valor: Math.round((valor || 0) * 100),
      dataInicio: dataInicio ? new Date(dataInicio) : new Date(),
      dataFim: dataFim ? new Date(dataFim) : null,
    },
    include: {
      aluno: { select: { id: true, nome: true, faixa: true, grau: true } },
      plano: { select: { id: true, nome: true, valor: true, periodo: true } },
    },
  })

  return NextResponse.json(contrato)
}

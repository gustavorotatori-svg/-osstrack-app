import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { contratoCreateSchema } from "@/lib/validation"

export async function GET() {
  try {
  const session = await getServerSession(authOptions)
  if (!session || !["dono", "professor"].includes(session.user.role) || !session.user.academiaId) {
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
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: Request) {
  try {
  const session = await getServerSession(authOptions)
  if (!session || !["dono", "professor"].includes(session.user.role) || !session.user.academiaId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = contratoCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos" }, { status: 400 })
  }
  const { alunoId, planoId, valor, dataInicio, dataFim } = parsed.data

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

  const plano = await prisma.planoMensalidade.findUnique({
    where: { id: planoId },
  })

  const dataInicioContrato = dataInicio ? new Date(dataInicio) : new Date()

  const contrato = await prisma.contrato.create({
    data: {
      alunoId,
      academiaId: session.user.academiaId,
      planoId,
      valor: Math.round((valor || 0) * 100),
      dataInicio: dataInicioContrato,
      dataFim: dataFim ? new Date(dataFim) : null,
    },
    include: {
      aluno: { select: { id: true, nome: true, faixa: true, grau: true } },
      plano: { select: { id: true, nome: true, valor: true, periodo: true, taxaMatricula: true } },
    },
  })

  if (plano?.taxaMatricula && plano.taxaMatricula > 0) {
    await prisma.cobranca.create({
      data: {
        contratoId: contrato.id,
        alunoId,
        academiaId: session.user.academiaId,
        valor: plano.taxaMatricula,
        dataVencimento: dataInicioContrato,
        status: "pendente",
        observacao: "Taxa de Matrícula",
      },
    })
  }

  return NextResponse.json(contrato)
  } catch (error) {
    return handleApiError(error)
  }

}
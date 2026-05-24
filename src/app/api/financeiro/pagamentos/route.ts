import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const where: any = { academiaId: session.user.academiaId }
  if (session.user.role === "aluno") where.usuarioId = session.user.id

  const pagamentos = await prisma.pagamento.findMany({
    where,
    include: { usuario: { select: { id: true, nome: true, faixa: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json(pagamentos)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { cobrancaId, valor, metodo } = await req.json()
  if (!cobrancaId || !valor) return NextResponse.json({ error: "cobrancaId e valor obrigatórios" }, { status: 400 })

  const cobranca = await prisma.cobranca.findUnique({
    where: { id: cobrancaId },
    include: { contrato: true },
  })
  if (!cobranca) return NextResponse.json({ error: "Cobrança não encontrada" }, { status: 404 })

  const now = new Date()
  const pagamento = await prisma.pagamento.create({
    data: {
      usuarioId: cobranca.alunoId,
      valor: Math.round(Number(valor) * 100),
      status: "confirmed",
      metodo: metodo || "pix",
      mesReferencia: now.getMonth() + 1,
      anoReferencia: now.getFullYear(),
    },
  })

  await prisma.cobranca.update({
    where: { id: cobrancaId },
    data: { status: "pago", dataPagamento: now, metodo: metodo || "pix" },
  })

  return NextResponse.json(pagamento, { status: 201 })
}

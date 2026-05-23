import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    include: { academia: { select: { nome: true } }, streak: true },
  })

  if (!usuario) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

  const totalAulas = await prisma.presenca.count({
    where: { alunoId: usuario.id, status: "confirmed" },
  })

  const totalPresencas = await prisma.presenca.count({
    where: { alunoId: usuario.id },
  })

  const thisMonth = await prisma.presenca.count({
    where: {
      alunoId: usuario.id,
      status: "confirmed",
      data: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    },
  })

  return NextResponse.json({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone,
    faixa: usuario.faixa,
    grau: usuario.grau,
    dataInicio: usuario.dataInicio,
    academia: usuario.academia.nome,
    totalAulas,
    totalPresencas,
    thisMonth,
    currentStreak: usuario.streak?.currentStreak || 0,
    bestStreak: usuario.streak?.bestStreak || 0,
  })
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { nome, telefone, avatar } = await request.json()

  const data: Record<string, string> = {}
  if (nome !== undefined) data.nome = nome
  if (telefone !== undefined) data.telefone = telefone
  if (avatar !== undefined) data.avatar = avatar

  const updated = await prisma.usuario.update({
    where: { id: session.user.id },
    data,
  })

  return NextResponse.json({ success: true, nome: updated.nome, telefone: updated.telefone, avatar: updated.avatar })
}

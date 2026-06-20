import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.academiaId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    if (session.user.role !== "dono" && session.user.role !== "professor") {
      return NextResponse.json({ error: "Apenas dono ou professor podem selecionar" }, { status: 403 })
    }

    const { alunoId } = await req.json()
    if (!alunoId) {
      return NextResponse.json({ error: "alunoId é obrigatório" }, { status: 400 })
    }

    const aluno = await prisma.usuario.findFirst({
      where: { id: alunoId, academiaId: session.user.academiaId, role: "aluno" },
    })
    if (!aluno) {
      return NextResponse.json({ error: "Aluno não encontrado nesta academia" }, { status: 404 })
    }

    const now = new Date()
    const mes = now.getMonth() + 1
    const ano = now.getFullYear()

    await prisma.mestreDoMes.upsert({
      where: { academiaId_mes_ano: { academiaId: session.user.academiaId, mes, ano } },
      update: { alunoId, totalAulas: 0 },
      create: { academiaId: session.user.academiaId, alunoId, mes, ano, totalAulas: 0 },
    })

    const mestre = await prisma.mestreDoMes.findFirst({
      where: { academiaId: session.user.academiaId, mes, ano },
      include: { aluno: { select: { nome: true, faixa: true, avatar: true } } },
    })

    return NextResponse.json({
      mestre: {
        nome: mestre!.aluno.nome,
        faixa: mestre!.aluno.faixa,
        avatar: mestre!.aluno.avatar,
        totalAulas: mestre!.totalAulas,
        mes: mestre!.mes,
        ano: mestre!.ano,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

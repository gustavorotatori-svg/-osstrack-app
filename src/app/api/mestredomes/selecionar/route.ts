import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { notificarUsuario } from "@/lib/notificar"
import { mestreSelecionarSchema } from "@/lib/validation"

const CATEGORIAS = ["adulto", "master", "infantil"]

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.academiaId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    if (session.user.role !== "dono" && session.user.role !== "professor") {
      return NextResponse.json({ error: "Apenas dono ou professor podem selecionar" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = mestreSelecionarSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "alunoId é obrigatório" }, { status: 400 })
    }
    const { alunoId, categoria } = parsed.data

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
      where: { academiaId_mes_ano_categoria: { academiaId: session.user.academiaId, mes, ano, categoria } },
      update: { alunoId, totalAulas: 0 },
      create: { academiaId: session.user.academiaId, alunoId, mes, ano, categoria, totalAulas: 0 },
    })

    const mestre = await prisma.mestreDoMes.findFirst({
      where: { academiaId: session.user.academiaId, mes, ano, categoria },
      include: { aluno: { select: { id: true, nome: true, faixa: true, avatar: true } } },
    })

    await notificarUsuario({
      usuarioId: mestre!.aluno.id,
      tipo: "conquista",
      titulo: `Mestre do Mes - ${categoria}`,
      descricao: `Parabens! Voce foi selecionado como Mestre do Mes (${categoria})! Continue assim!`,
      link: "/dashboard/aluno/ranking",
    }).catch(() => {})

    return NextResponse.json({
      mestre: {
        nome: mestre!.aluno.nome,
        faixa: mestre!.aluno.faixa,
        avatar: mestre!.aluno.avatar,
        totalAulas: mestre!.totalAulas,
        mes: mestre!.mes,
        ano: mestre!.ano,
        categoria: mestre!.categoria,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
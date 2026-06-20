import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      include: {
        presencas: true,
        notificacoes: true,
        metasSemanais: true,
        missoesDiarias: true,
        postagensMural: true,
        comentariosMural: true,
        curtidasMural: true,
        streak: true,
        contratos: true,
        cobrancas: true,
        agendamentos: true,
        convites: true,
        turmasAluno: true,
      },
    })

    if (!usuario) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    await prisma.$transaction(async (tx) => {
      await tx.presenca.deleteMany({ where: { alunoId: usuario.id } })
      await tx.notificacao.deleteMany({ where: { usuarioId: usuario.id } })
      await tx.metaSemanal.deleteMany({ where: { alunoId: usuario.id } })
      await tx.missaoDiaria.deleteMany({ where: { alunoId: usuario.id } })
      await tx.comentarioMural.deleteMany({ where: { usuarioId: usuario.id } })
      await tx.curtidaMural.deleteMany({ where: { usuarioId: usuario.id } })
      await tx.postagemMural.deleteMany({ where: { alunoId: usuario.id } })
      await tx.streak.deleteMany({ where: { usuarioId: usuario.id } })
      await tx.agendamento.deleteMany({ where: { alunoId: usuario.id } })
      await tx.convite.deleteMany({ where: { remetenteId: usuario.id } })
      await tx.turmaAluno.deleteMany({ where: { alunoId: usuario.id } })
      await tx.cobranca.deleteMany({ where: { alunoId: usuario.id } })
      await tx.contrato.deleteMany({ where: { alunoId: usuario.id } })
      await tx.usuario.delete({ where: { id: usuario.id } })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      include: {
        presencas: true,
        streak: true,
      },
    })

    if (!usuario) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    return NextResponse.json({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      faixa: usuario.faixa,
      grau: usuario.grau,
      role: usuario.role,
      dataInicio: usuario.dataInicio,
      dataCriacao: usuario.createdAt,
      totalAulas: usuario.presencas.filter((p) => p.status === "confirmed").length,
      streak: {
        current: usuario.streak?.currentStreak || 0,
        best: usuario.streak?.bestStreak || 0,
      },
      consentimentos: {
        termos: usuario.aceitouTermos,
        lgpd: usuario.aceitouLGPD,
        marketing: usuario.aceitouMarketing,
        dataAceite: usuario.dataAceite,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

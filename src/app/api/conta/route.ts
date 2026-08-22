import { NextResponse } from "next/server"
import crypto from "crypto"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { decryptCpf } from "@/lib/cpf-crypto"

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const usuario = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      include: { academia: true },
    })

    if (!usuario) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    await prisma.$transaction(async (tx) => {
      // Referências soltas (strings sem FK)
      await tx.presenca.updateMany({ where: { confirmadoPor: usuario.id }, data: { confirmadoPor: null } })
      await tx.checkinCodigo.updateMany({ where: { criadoPor: usuario.id }, data: { criadoPor: "excluido" } })
      await tx.checkinCodigo.updateMany({ where: { usadoPor: usuario.id }, data: { usadoPor: null } })
      await tx.convite.updateMany({ where: { professorId: usuario.id }, data: { professorId: null } })

      // Vínculo professor -> alunos
      await tx.usuario.updateMany({ where: { professorId: usuario.id }, data: { professorId: null } })

      // Turmas e horários criados pelo usuário (caso seja professor)
      const turmaIds = await tx.turma.findMany({ where: { professorId: usuario.id }, select: { id: true } })
      const ids = turmaIds.map((t) => t.id)
      if (ids.length) {
        await tx.turmaAluno.deleteMany({ where: { turmaId: { in: ids } } })
        await tx.agendamento.deleteMany({ where: { horario: { turmaId: { in: ids } } } })
        await tx.horarioAula.deleteMany({ where: { turmaId: { in: ids } } })
        await tx.turma.deleteMany({ where: { id: { in: ids } } })
      }
      await tx.horarioAula.deleteMany({ where: { professorId: usuario.id } })

      // Dados pessoais do usuário
      await tx.alunoConquista.deleteMany({ where: { alunoId: usuario.id } })
      await tx.alunoDoMes.deleteMany({ where: { alunoId: usuario.id } })
      await tx.presenca.deleteMany({ where: { alunoId: usuario.id } })
      await tx.turmaAluno.deleteMany({ where: { alunoId: usuario.id } })
      await tx.progressoSemanal.deleteMany({ where: { alunoId: usuario.id } })
      await tx.missaoDiaria.deleteMany({ where: { alunoId: usuario.id } })
      await tx.comentarioMural.deleteMany({ where: { usuarioId: usuario.id } })
      await tx.curtidaMural.deleteMany({ where: { usuarioId: usuario.id } })
      await tx.postagemMural.deleteMany({ where: { alunoId: usuario.id } })
      await tx.streak.deleteMany({ where: { usuarioId: usuario.id } })
      await tx.agendamento.deleteMany({ where: { alunoId: usuario.id } })
      await tx.convite.deleteMany({ where: { remetenteId: usuario.id } })
      await tx.cobranca.deleteMany({ where: { alunoId: usuario.id } })
      await tx.contrato.deleteMany({ where: { alunoId: usuario.id } })
      await tx.pushSubscription.deleteMany({ where: { usuarioId: usuario.id } })
      await tx.premiumSubscription.deleteMany({ where: { usuarioId: usuario.id } })
      await tx.participacaoCompeticao.deleteMany({ where: { alunoId: usuario.id } })
      await tx.familiaMembro.deleteMany({ where: { alunoId: usuario.id } })
      await tx.notificacao.deleteMany({ where: { usuarioId: usuario.id } })

      // PII fora das tabelas do usuário (LGPD Art. 18 VI — eliminação completa)
      await tx.rateLimitAttempt.deleteMany({ where: { identifier: `email:${usuario.email}` } })
      await tx.contato.deleteMany({ where: { email: usuario.email } })

      if (usuario.role === "dono" && usuario.academiaId) {
        // Anonimiza o dono e remove seus dados pessoais da academia, mantendo a academia ativa
        await tx.academia.update({
          where: { id: usuario.academiaId },
          data: { responsavel: "Usuário excluído", telefone: "", whatsapp: null, pixKey: null },
        })
        await tx.usuario.update({
          where: { id: usuario.id },
          data: {
            nome: "Usuário excluído",
            email: `excluido-${usuario.id}@excluido.osstrack.app`,
            senha: crypto.randomBytes(32).toString("hex"),
            telefone: null,
            avatar: null,
            dataNascimento: null,
            faixa: "Branca",
            grau: 0,
            emailVerified: null,
            emailVerificationToken: null,
            aceitouMarketing: false,
            responsavelNome: null,
            responsavelCpf: null,
            consentimentoResponsavel: false,
          },
        })
      } else {
        await tx.usuario.delete({ where: { id: usuario.id } })
      }
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
        presencas: { orderBy: { data: "desc" } },
        progressosSemanais: { orderBy: { semanaInicio: "desc" } },
        missoesDiarias: true,
        streak: true,
        contratos: { include: { plano: true, cobrancas: true } },
        agendamentos: { orderBy: { data: "desc" } },
        alunoDoMes: true,
        participacoesCompeticao: true,
        familiaMembros: { include: { familia: true } },
        convites: true,
        postagensMural: true,
        comentariosMural: true,
        premiumSubscription: true,
        turmasAluno: true,
        notificacoes: true,
        pushSubscriptions: true,
      },
    })

    if (!usuario) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    const conquistas = await prisma.alunoConquista.findMany({
      where: { alunoId: usuario.id },
      include: { conquista: true },
      orderBy: { createdAt: "desc" },
    })

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
        termosVersao: usuario.termosVersao,
        lgpdVersao: usuario.lgpdVersao,
        responsavel: usuario.consentimentoResponsavel
          ? { nome: usuario.responsavelNome, cpf: decryptCpf(usuario.responsavelCpf) }
          : null,
      },
      presencas: usuario.presencas,
      progressosSemanais: usuario.progressosSemanais,
      missoesDiarias: usuario.missoesDiarias,
      conquistas,
      contratos: usuario.contratos,
      agendamentos: usuario.agendamentos,
      alunoDoMes: usuario.alunoDoMes,
      participacoesCompeticao: usuario.participacoesCompeticao,
      familia: usuario.familiaMembros,
      convites: usuario.convites,
      postagensMural: usuario.postagensMural,
      comentariosMural: usuario.comentariosMural,
      turmasAluno: usuario.turmasAluno,
      notificacoes: usuario.notificacoes,
      premiumSubscription: usuario.premiumSubscription,
      pushSubscriptions: usuario.pushSubscriptions,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

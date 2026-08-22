import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { notificarUsuario } from "@/lib/notificar"

export const maxDuration = 60

function inicioDoDia(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export async function GET(req: Request) {
  try {
    const isVercelCron = req.headers.get("x-vercel-cron")
    const isCronWithSecret = process.env.CRON_SECRET && req.headers.get("x-cron-secret") === process.env.CRON_SECRET
    if (!isVercelCron && !isCronWithSecret) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const agora = new Date()
    const mes = agora.getMonth()
    const ano = agora.getFullYear()
    const vencimento = new Date(ano, mes, 10, 23, 59, 59)
    const hoje = inicioDoDia(agora)

    // ---------- 1) GERAÇÃO: cobrança do mês para contratos ativos ----------
    const contratos = await prisma.contrato.findMany({
      where: { status: { in: ["ativo", "inadimplente"] } },
      include: {
        aluno: { select: { id: true } },
        cobrancas: { orderBy: { dataVencimento: "desc" }, take: 1 },
      },
    })

    let geradas = 0
    for (const contrato of contratos) {
      const ultima = contrato.cobrancas[0]
      if (ultima) {
        const ud = new Date(ultima.dataVencimento)
        if (ud.getMonth() === mes && ud.getFullYear() === ano) continue
      }

      await prisma.cobranca.create({
        data: {
          contratoId: contrato.id,
          alunoId: contrato.alunoId,
          academiaId: contrato.academiaId,
          valor: contrato.valor,
          dataVencimento: vencimento,
          status: "pendente",
        },
      })
      geradas++

      await notificarUsuario({
        usuarioId: contrato.alunoId,
        tipo: "cobranca",
        titulo: "Mensalidade lançada",
        descricao: `Sua mensalidade deste mês foi lançada. Vencimento: ${vencimento.toLocaleDateString("pt-BR")}.`,
        link: "/dashboard/aluno",
      }).catch(() => {})
    }

    // ---------- 2) LEMBRETE: cobranças pendentes em aberto/vendidas ----------
    const pendentes = await prisma.cobranca.findMany({
      where: { status: "pendente", dataVencimento: { lte: hoje } },
      include: {
        aluno: { select: { id: true, nome: true } },
        contrato: { select: { plano: { select: { nome: true } } } },
      },
    })

    let lembretes = 0
    const alunosNotificados = new Set<string>()
    for (const cob of pendentes) {
      if (alunosNotificados.has(cob.alunoId)) continue

      const jaNotificado = await prisma.notificacao.findFirst({
        where: {
          usuarioId: cob.alunoId,
          tipo: "cobranca",
          createdAt: { gte: cob.dataVencimento },
        },
      })
      if (jaNotificado) {
        alunosNotificados.add(cob.alunoId)
        continue
      }

      alunosNotificados.add(cob.alunoId)
      await notificarUsuario({
        usuarioId: cob.alunoId,
        tipo: "cobranca",
        titulo: "Mensalidade em aberto",
        descricao: `Sua mensalidade está pendente (${cob.contrato?.plano?.nome || "plano"}). Regularize com a academia.`,
        link: "/dashboard/aluno",
      }).catch(() => {})
      lembretes++
    }

    await prisma.cronLog.create({ data: { tipo: "cobrancas" } }).catch(() => {})

    return NextResponse.json({ ok: true, geradas, lembretes, contratosAtivos: contratos.length, pendentes: pendentes.length })
  } catch (error) {
    return handleApiError(error)
  }
}

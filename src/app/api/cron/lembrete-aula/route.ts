import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { notificarUsuario } from "@/lib/notificar"

export const maxDuration = 60

export async function GET(req: Request) {
  try {
    const isVercelCron = req.headers.get("x-vercel-cron")
    const isCronWithSecret = process.env.CRON_SECRET && req.headers.get("x-cron-secret") === process.env.CRON_SECRET
    if (!isVercelCron && !isCronWithSecret) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const agora = new Date()
    const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
    const fimHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1)

    const agendamentos = await prisma.agendamento.findMany({
      where: { status: "confirmado", data: { gte: inicioHoje, lt: fimHoje } },
      include: {
        aluno: { select: { id: true } },
        horario: {
          select: {
            horaInicio: true,
            turma: { select: { nome: true } },
          },
        },
      },
    })

    const porAluno = new Map<string, { titulo: string; horarios: Date[] }>()
    for (const ag of agendamentos) {
      const nome = ag.horario.turma.nome || "Aula"
      if (!porAluno.has(ag.alunoId)) porAluno.set(ag.alunoId, { titulo: nome, horarios: [] })
      porAluno.get(ag.alunoId)!.horarios.push(ag.data)
    }

    let lembretes = 0
    for (const [alunoId, info] of porAluno) {
      const jaNotificado = await prisma.notificacao.findFirst({
        where: { usuarioId: alunoId, tipo: "aula", createdAt: { gte: inicioHoje } },
      })
      if (jaNotificado) continue

      const primeiro = new Date(info.horarios[0])
      const hora = primeiro.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      const qtd = info.horarios.length
      await notificarUsuario({
        usuarioId: alunoId,
        tipo: "aula",
        titulo: qtd > 1 ? `Você tem ${qtd} aulas hoje` : `${info.titulo} hoje`,
        descricao: qtd > 1
          ? `Sua primeira aula começa às ${hora}. Nos vemos no tatame!`
          : `Sua aula começa às ${hora}. Nos vemos no tatame!`,
        link: "/dashboard/aluno/agenda",
      }).catch(() => {})
      lembretes++
    }

    await prisma.cronLog.create({ data: { tipo: "lembrete-aula" } }).catch(() => {})

    return NextResponse.json({ ok: true, lembretes, aulasHoje: agendamentos.length })
  } catch (error) {
    return handleApiError(error)
  }
}

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { notificarUsuario } from "@/lib/notificar"
import { sendEmail, renderEmailLayout } from "@/lib/email"

export const maxDuration = 60

const DIAS_ENTRE_LEMBRETES = 6

type Alvo = { id: string; nome: string; email: string }

async function notificar(alvo: Alvo, titulo: string, descricao: string, link: string) {
  await notificarUsuario({
    usuarioId: alvo.id,
    tipo: "reengagement",
    titulo,
    descricao,
    link,
  }).catch(() => {})

  await sendEmail({
    to: alvo.email,
    subject: titulo,
    html: renderEmailLayout(
      titulo,
      `Olá, ${alvo.nome}! ${descricao}`,
      { label: "Voltar ao treino", url: `${process.env.NEXTAUTH_URL || "https://osstrack.com.br"}${link}` }
    ),
  }).catch(() => {})
}

export async function GET(req: Request) {
  try {
    const isVercelCron = req.headers.get("x-vercel-cron")
    const isCronWithSecret = process.env.CRON_SECRET && req.headers.get("x-cron-secret") === process.env.CRON_SECRET
    if (!isVercelCron && !isCronWithSecret) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const hoje = new Date()
    const tresDiasAtras = new Date(hoje.getTime() - 3 * 24 * 60 * 60 * 1000)
    const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000)
    const quatorzeDiasAtras = new Date(hoje.getTime() - 14 * 24 * 60 * 60 * 1000)
    const quatroDiasAtras = new Date(hoje.getTime() - 4 * 24 * 60 * 60 * 1000)
    const oitoDiasAtras = new Date(hoje.getTime() - 8 * 24 * 60 * 60 * 1000)
    const seisDiasAtras = new Date(hoje.getTime() - DIAS_ENTRE_LEMBRETES * 24 * 60 * 60 * 1000)

    const selectAlvo = { id: true, nome: true, email: true } as const

    const inativos3d = await prisma.usuario.findMany({
      where: {
        role: "aluno",
        presencas: { none: { data: { gte: tresDiasAtras }, status: "confirmed" } },
      },
      select: selectAlvo,
    })

    const inativos7d = await prisma.usuario.findMany({
      where: {
        role: "aluno",
        presencas: { none: { data: { gte: seteDiasAtras }, status: "confirmed" } },
      },
      select: selectAlvo,
    })

    const inativos14d = await prisma.usuario.findMany({
      where: {
        role: "aluno",
        presencas: { none: { data: { gte: quatorzeDiasAtras }, status: "confirmed" } },
      },
      select: selectAlvo,
    })

    const novosSemCheckin = await prisma.usuario.findMany({
      where: {
        role: "aluno",
        createdAt: { gte: oitoDiasAtras, lte: quatroDiasAtras },
        presencas: { none: { status: "confirmed" } },
      },
      select: selectAlvo,
    })

    const avisadosRecente = await prisma.notificacao.findMany({
      where: { tipo: "reengagement", createdAt: { gte: seisDiasAtras } },
      select: { usuarioId: true },
      distinct: ["usuarioId"],
    })
    const jaAvisado = new Set(avisadosRecente.map((n) => n.usuarioId))

    const d3 = inativos3d.filter((u) => !inativos7d.some((i) => i.id === u.id))
    const d7 = inativos7d.filter((u) => !inativos14d.some((i) => i.id === u.id))
    const d14 = inativos14d.filter((u) => !novosSemCheckin.some((i) => i.id === u.id))

    let total = 0
    const alvos = (bucket: Alvo[]) => bucket.filter((u) => !jaAvisado.has(u.id))

    for (const u of alvos(novosSemCheckin)) {
      await notificar(
        u,
        "Primeiro passo no tatame!",
        "Você criou sua conta, mas ainda não fez seu primeiro check-in. Que tal começar hoje?",
        "/dashboard/aluno"
      )
      total++
    }

    for (const u of alvos(d3)) {
      await notificar(
        u,
        "Saudades do tatame!",
        "Você não treina há 3 dias. Que tal voltar hoje?",
        "/dashboard/aluno"
      )
      total++
    }

    for (const u of alvos(d7)) {
      await notificar(
        u,
        "Não desista!",
        "Já faz 7 dias sem treinar. A consistência é o segredo do Jiu-Jitsu!",
        "/dashboard/aluno"
      )
      total++
    }

    for (const u of alvos(d14)) {
      await notificar(
        u,
        "Sentimos sua falta!",
        "14 dias sem você. Volte e ganhe XP em dobro no próximo check-in!",
        "/dashboard/aluno"
      )
      total++
    }

    await prisma.cronLog.create({ data: { tipo: "reengagement" } }).catch(() => {})

    return NextResponse.json({
      ok: true,
      totalSent: total,
      novosSemCheckin: novosSemCheckin.length,
      d3: d3.length,
      d7: d7.length,
      d14: d14.length,
      jaAvisadoRecente: jaAvisado.size,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

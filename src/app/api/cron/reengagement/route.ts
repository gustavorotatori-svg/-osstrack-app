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

    const hoje = new Date()
    const tresDiasAtras = new Date(hoje.getTime() - 3 * 24 * 60 * 60 * 1000)
    const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000)
    const quatorzeDiasAtras = new Date(hoje.getTime() - 14 * 24 * 60 * 60 * 1000)

    const inativos3d = await prisma.usuario.findMany({
      where: {
        role: "aluno",
        presencas: {
          none: { data: { gte: tresDiasAtras }, status: "confirmed" },
        },
      },
      select: { id: true, nome: true },
    })

    const inativos7d = await prisma.usuario.findMany({
      where: {
        role: "aluno",
        presencas: {
          none: { data: { gte: seteDiasAtras }, status: "confirmed" },
        },
      },
      select: { id: true, nome: true },
    })

    const inativos14d = await prisma.usuario.findMany({
      where: {
        role: "aluno",
        presencas: {
          none: { data: { gte: quatorzeDiasAtras }, status: "confirmed" },
        },
      },
      select: { id: true, nome: true },
    })

    const notificados3d = inativos3d.filter(u => !inativos7d.some(i => i.id === u.id))
    const notificados7d = inativos7d.filter(u => !inativos14d.some(i => i.id === u.id))

    let totalSent = 0

    for (const u of notificados3d) {
      await notificarUsuario({
        usuarioId: u.id,
        tipo: "reengagement",
        titulo: "Saudades do tatame!",
        descricao: "Voce nao treina ha 3 dias. Que tal voltar hoje?",
        link: "/dashboard/aluno",
      }).catch(() => {})
      totalSent++
    }

    for (const u of notificados7d) {
      await notificarUsuario({
        usuarioId: u.id,
        tipo: "reengagement",
        titulo: "Nao desista!",
        descricao: "Ja faz 7 dias sem treinar. A consistencia e o segredo do Jiu-Jitsu!",
        link: "/dashboard/aluno",
      }).catch(() => {})
      totalSent++
    }

    for (const u of inativos14d) {
      await notificarUsuario({
        usuarioId: u.id,
        tipo: "reengagement",
        titulo: "Sentimos sua falta!",
        descricao: "14 dias sem voce. Volte e ganhe XP em dobro no proximo check-in!",
        link: "/dashboard/aluno",
      }).catch(() => {})
      totalSent++
    }

    return NextResponse.json({
      ok: true,
      totalSent,
      d3: notificados3d.length,
      d7: notificados7d.length,
      d14: inativos14d.length,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

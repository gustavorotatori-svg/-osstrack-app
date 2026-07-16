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
    hoje.setHours(0, 0, 0, 0)
    const amanha = new Date(hoje.getTime() + 24 * 60 * 60 * 1000)

    const alunosSemCheckin = await prisma.usuario.findMany({
      where: {
        role: "aluno",
        presencas: {
          none: { data: { gte: hoje, lt: amanha }, status: "confirmed" },
        },
      },
      select: { id: true, nome: true },
    })

    let sent = 0
    for (const a of alunosSemCheckin) {
      await notificarUsuario({
        usuarioId: a.id,
        tipo: "lembrete",
        titulo: "Ja treinou hoje?",
        descricao: "Nao deixe o dia passar sem treinar! Mantenha seu streak aceso.",
        link: "/dashboard/aluno/checkin",
      }).catch(() => {})
      sent++
    }

    return NextResponse.json({ ok: true, sent, total: alunosSemCheckin.length })
  } catch (error) {
    return handleApiError(error)
  }
}

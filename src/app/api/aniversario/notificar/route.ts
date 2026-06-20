import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { sendPushToUser } from "@/lib/webpush"
import { handleApiError } from "@/lib/api-error"

export async function POST(req: NextRequest) {
  try {
    // Allow Vercel cron (x-vercel-cron header set by Vercel infra),
    // custom cron trigger via CRON_SECRET header, or authenticated admin
    const isVercelCron = req.headers.get("x-vercel-cron") === "1"
    const isCronWithSecret = process.env.CRON_SECRET && req.headers.get("x-cron-secret") === process.env.CRON_SECRET

    if (!isVercelCron && !isCronWithSecret) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== "dono") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
      }
    }
    const hoje = new Date()
    const mesAtual = String(hoje.getMonth() + 1).padStart(2, "0")
    const diaAtual = String(hoje.getDate()).padStart(2, "0")

    const usuarios = await prisma.usuario.findMany({
      where: { dataNascimento: { not: null } },
      select: { id: true, dataNascimento: true },
    })

    const aniversariantes = usuarios.filter((u) => {
      if (!u.dataNascimento) return false
      const [_, mes, dia] = u.dataNascimento.split("-")
      return mes === mesAtual && dia === diaAtual
    })

    let notificados = 0

    for (const usuario of aniversariantes) {
      await prisma.notificacao.create({
        data: {
          usuarioId: usuario.id,
          tipo: "sistema",
          titulo: "Feliz Aniversário! 🎂",
          descricao: "Hoje é seu dia especial! 🎉",
          link: "/dashboard/aluno/perfil",
        },
      })

      await sendPushToUser(usuario.id, {
        title: "Feliz Aniversário! 🎂",
        body: "Hoje é seu dia especial! 🎉",
        url: "/dashboard/aluno/perfil",
      })

      notificados++
    }

    return NextResponse.json({
      ok: true,
      notificados,
      total: aniversariantes.length,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

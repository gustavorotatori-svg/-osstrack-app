import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { notificarUsuario } from "@/lib/notificar"
import { sendEmail, renderEmailLayout } from "@/lib/email"

export const maxDuration = 60

const BASE_URL = process.env.NEXTAUTH_URL || "https://osstrack.com.br"

type Alvo = { id: string; nome: string; email: string; createdAt: Date }

function diasDesde(data: Date): number {
  return Math.floor((Date.now() - data.getTime()) / (24 * 60 * 60 * 1000))
}

async function enviarDrip(alvo: Alvo, titulo: string, corpo: string, ctaLabel: string, ctaLink: string, notifTipo: string, notifTitulo: string, notifDesc: string) {
  await notificarUsuario({
    usuarioId: alvo.id,
    tipo: notifTipo,
    titulo: notifTitulo,
    descricao: notifDesc,
    link: ctaLink,
  }).catch(() => {})

  await sendEmail({
    to: alvo.email,
    subject: titulo.replace(/[🥋🏆⚡📊🔥💡🎯]/g, "").trim(),
    html: renderEmailLayout(titulo, corpo, { label: ctaLabel, url: `${BASE_URL}${ctaLink}` }),
  }).catch(() => {})
}

export async function GET(req: Request) {
  try {
    const isVercelCron = req.headers.get("x-vercel-cron")
    const isCronWithSecret = process.env.CRON_SECRET && req.headers.get("x-cron-secret") === process.env.CRON_SECRET
    if (!isVercelCron && !isCronWithSecret) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const agora = new Date()

    // Busca alunos criados nos últimos 16 dias
    const dezesseisDiasAtras = new Date(agora.getTime() - 16 * 24 * 60 * 60 * 1000)
    const alunos = await prisma.usuario.findMany({
      where: {
        role: "aluno",
        createdAt: { gte: dezesseisDiasAtras },
        aceitouMarketing: true,
      },
      select: { id: true, nome: true, email: true, createdAt: true },
    })

    // Verifica quais já receberam drip recentemente ( throttle: 1 por dia por tipo )
    const umDiaAtras = new Date(agora.getTime() - 24 * 60 * 60 * 1000)
    const notificacoesRecentes = await prisma.notificacao.findMany({
      where: {
        tipo: { startsWith: "drip_" },
        createdAt: { gte: umDiaAtras },
      },
      select: { usuarioId: true, tipo: true },
    })
    const jaEnviado = new Set(notificacoesRecentes.map((n) => `${n.usuarioId}:${n.tipo}`))

    let total = 0

    for (const aluno of alunos) {
      const dias = diasDesde(aluno.createdAt)
      const primeiroNome = aluno.nome.split(" ")[0]

      // DIA 1: Dicas de check-in
      if (dias >= 1 && dias <= 2 && !jaEnviado.has(`${aluno.id}:drip_dia1`)) {
        await enviarDrip(
          aluno,
          `${primeiroNome}, já sabe como fazer check-in? 📍`,
          `Fazer check-in é simples: abra o OssTrack na hora da aula, clique no botão e pronto! Sua presença é registrada automaticamente.<br><br><strong>Dica:</strong> adicione o OssTrack à tela inicial do celular para acessar mais rápido.`,
          "Fazer Check-in",
          "/dashboard/aluno/checkin",
          "drip_dia1",
          "Dicas de check-in",
          "Dicas para aproveitar ao máximo o check-in"
        )
        total++
      }

      // DIA 3: Gamificação
      if (dias >= 3 && dias <= 4 && !jaEnviado.has(`${aluno.id}:drip_dia3`)) {
        await enviarDrip(
          aluno,
          `${primeiroNome}, mantenha seu streak! 🔥`,
          `Cada dia que você treina, seu streak cresce. Streaks maiores desbloqueiam conquistas especiais e te colocam no topo do ranking da academia!<br><br><strong>Meta:</strong> alcance 7 dias seguidos e ganhe a conquista "Semana Perfeita".`,
          "Ver Minhas Conquistas",
          "/dashboard/aluno/conquistas",
          "drip_dia3",
          "Dicas de gamificação",
          "Como funcionam streaks e conquistas"
        )
        total++
      }

      // DIA 7: Ranking
      if (dias >= 7 && dias <= 8 && !jaEnviado.has(`${aluno.id}:drip_dia7`)) {
        await enviarDrip(
          aluno,
          `${primeiroNome}, veja como você está no ranking! 🏆`,
          `Você já está há uma semana no OssTrack! Que tal conferir sua posição no ranking da academia?<br><br>Quanto mais aulas você faz, mais alto sobe. Competition entre amigos é o que mantém a motivação!`,
          "Ver Ranking",
          "/dashboard/aluno/ranking",
          "drip_dia7",
          "Dica de ranking",
          "Convidar aluno para ver ranking"
        )
        total++
      }

      // DIA 14: Compartilhar
      if (dias >= 14 && dias <= 15 && !jaEnviado.has(`${aluno.id}:drip_dia14`)) {
        await enviarDrip(
          aluno,
          `${primeiroNome}, compartilhe sua evolução! 🎯`,
          `Duas semanas de treino! Você já tem dados de evolução para compartilhar.<br><br>Gere uma imagem personalizada com sua faixa, streak e total de aulas. Compartilhe no WhatsApp ou Instagram!`,
          "Compartilhar Evolução",
          "/dashboard/aluno/compartilhar",
          "drip_dia14",
          "Compartilhar evolução",
          "Convidar aluno a compartilhar evolução"
        )
        total++
      }
    }

    await prisma.cronLog.create({ data: { tipo: "drip_emails" } }).catch(() => {})

    return NextResponse.json({ ok: true, totalSent: total, totalAlunos: alunos.length })
  } catch (error) {
    return handleApiError(error)
  }
}

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { sendEmail, renderEmailLayout } from "@/lib/email"

export const maxDuration = 60

export async function GET(req: Request) {
  try {
    const isVercelCron = req.headers.get("x-vercel-cron")
    const isCronWithSecret = process.env.CRON_SECRET && req.headers.get("x-cron-secret") === process.env.CRON_SECRET
    if (!isVercelCron && !isCronWithSecret) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const agora = new Date()
    const diaSemana = agora.getDay()
    const diffSegunda = diaSemana === 0 ? 6 : diaSemana - 1
    const segunda = new Date(agora)
    segunda.setDate(agora.getDate() - diffSegunda)
    segunda.setHours(0, 0, 0, 0)
    const sexta = new Date(segunda)
    sexta.setDate(segunda.getDate() + 4)
    sexta.setHours(23, 59, 59, 999)

    const fmt = (d: Date) => d.toLocaleDateString("pt-BR")

    // Novos cadastros na semana
    const [novosAlunos, novosProfessores, novasAcademias, novosLeads] = await Promise.all([
      prisma.usuario.count({ where: { role: "aluno", createdAt: { gte: segunda, lte: sexta } } }),
      prisma.usuario.count({ where: { role: "professor", createdAt: { gte: segunda, lte: sexta } } }),
      prisma.academia.count({ where: { createdAt: { gte: segunda, lte: sexta } } }),
      prisma.lead.count({ where: { createdAt: { gte: segunda, lte: sexta } } }),
    ])

    // Presenças/check-ins na semana
    const presencasSemana = await prisma.presenca.count({
      where: { data: { gte: segunda, lte: sexta }, status: "confirmed" },
    })

    // Alunos que treinaram pelo menos 1x na semana
    const alunosAtivos = await prisma.presenca.groupBy({
      by: ["alunoId"],
      where: { data: { gte: segunda, lte: sexta }, status: "confirmed" },
    })

    // Cobranças na semana
    const [cobrancasGeradas, cobrancasPagas] = await Promise.all([
      prisma.cobranca.count({ where: { dataVencimento: { gte: segunda, lte: sexta } } }),
      prisma.cobranca.aggregate({
        _sum: { valor: true },
        _count: { id: true },
        where: { status: "pago", dataPagamento: { gte: segunda, lte: sexta } } ,
      }),
    ])

    const valorRecebido = cobrancasPagas._sum?.valor || 0
    const pagas = cobrancasPagas._count?.id || 0

    // Totais gerais
    const [totalAlunos, totalProfessores, totalAcademias] = await Promise.all([
      prisma.usuario.count({ where: { role: "aluno" } }),
      prisma.usuario.count({ where: { role: "professor" } }),
      prisma.academia.count(),
    ])

    const taxaAtividade = totalAlunos > 0 ? Math.round((alunosAtivos.length / totalAlunos) * 100) : 0
    const ticketMedio = pagas > 0 ? Math.round(valorRecebido / pagas) : 0

    // Montar semana (seg-sex)
    const dias = ["seg", "ter", "qua", "qui", "sex"]
    const presencasPorDia: { dia: string; total: number }[] = []
    for (let i = 0; i < 5; i++) {
      const inicio = new Date(segunda)
      inicio.setDate(segunda.getDate() + i)
      inicio.setHours(0, 0, 0, 0)
      const fim = new Date(inicio)
      fim.setHours(23, 59, 59, 999)
      const count = await prisma.presenca.count({
        where: { data: { gte: inicio, lte: fim }, status: "confirmed" },
      })
      presencasPorDia.push({ dia: dias[i], total: count })
    }

    const maxPresencasDia = Math.max(...presencasPorDia.map((p) => p.total), 1)
    const graficoAscii = presencasPorDia.map((p) => {
      const barras = Math.round((p.total / maxPresencasDia) * 10)
      return `  ${p.dia.toUpperCase()}  ${"█".repeat(Math.max(1, barras))} ${p.total}`
    }).join("\n")

    const bodyHtml = `
      <p style="color:#888; font-size:13px; margin-bottom:24px;">
        Relatório da semana de <strong>${fmt(segunda)}</strong> a <strong>${fmt(sexta)}</strong>
      </p>

      <h2 style="font-size:16px; color:#c9a84c; margin:28px 0 12px;">📊 Atividade</h2>
      <table style="width:100%; font-size:14px; color:#ccc; border-collapse:collapse;">
        <tr><td style="padding:6px 0;">Alunos ativos (treinaram)</td><td style="text-align:right; font-weight:700;">${alunosAtivos.length}</td></tr>
        <tr><td style="padding:6px 0;">Taxa de atividade</td><td style="text-align:right; font-weight:700;">${taxaAtividade}%</td></tr>
        <tr><td style="padding:6px 0;">Check-ins na semana</td><td style="text-align:right; font-weight:700;">${presencasSemana}</td></tr>
      </table>

      <h2 style="font-size:16px; color:#c9a84c; margin:28px 0 12px;">📈 Presenças por dia</h2>
      <pre style="background:#0d0d0d; padding:16px; border-radius:10px; font-size:13px; color:#ccc; line-height:1.8; overflow-x:auto;">${graficoAscii}</pre>

      <h2 style="font-size:16px; color:#c9a84c; margin:28px 0 12px;">💰 Financeiro</h2>
      <table style="width:100%; font-size:14px; color:#ccc; border-collapse:collapse;">
        <tr><td style="padding:6px 0;">Cobranças geradas</td><td style="text-align:right; font-weight:700;">${cobrancasGeradas}</td></tr>
        <tr><td style="padding:6px 0;">Pagamentos recebidos</td><td style="text-align:right; font-weight:700;">${pagas}</td></tr>
        <tr><td style="padding:6px 0;">Valor recebido</td><td style="text-align:right; font-weight:700; color:#4ade80;">R$ ${(valorRecebido / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td></tr>
        <tr><td style="padding:6px 0;">Ticket médio</td><td style="text-align:right; font-weight:700;">R$ ${(ticketMedio / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td></tr>
      </table>

      <h2 style="font-size:16px; color:#c9a84c; margin:28px 0 12px;">🌱 Crescimento</h2>
      <table style="width:100%; font-size:14px; color:#ccc; border-collapse:collapse;">
        <tr><td style="padding:6px 0;">Novos alunos</td><td style="text-align:right; font-weight:700; color:#4ade80;">+${novosAlunos}</td></tr>
        <tr><td style="padding:6px 0;">Novos professores</td><td style="text-align:right; font-weight:700; color:#4ade80;">+${novosProfessores}</td></tr>
        <tr><td style="padding:6px 0;">Novas academias</td><td style="text-align:right; font-weight:700; color:#4ade80;">+${novasAcademias}</td></tr>
        <tr><td style="padding:6px 0;">Novos leads</td><td style="text-align:right; font-weight:700; color:#4ade80;">+${novosLeads}</td></tr>
      </table>

      <h2 style="font-size:16px; color:#c9a84c; margin:28px 0 12px;">📋 Totais gerais</h2>
      <table style="width:100%; font-size:14px; color:#ccc; border-collapse:collapse;">
        <tr><td style="padding:6px 0;">Total de alunos</td><td style="text-align:right; font-weight:700;">${totalAlunos}</td></tr>
        <tr><td style="padding:6px 0;">Total de professores</td><td style="text-align:right; font-weight:700;">${totalProfessores}</td></tr>
        <tr><td style="padding:6px 0;">Total de academias</td><td style="text-align:right; font-weight:700;">${totalAcademias}</td></tr>
      </table>
    `

    const html = renderEmailLayout(
      `Relatório Semanal OssTrack`,
      bodyHtml,
      { label: "Abrir painel", url: "https://osstrack.com.br/dashboard/dono/relatorios" }
    )

    const emailDestino = "passador@osstrack.com.br"

    await sendEmail({
      to: emailDestino,
      subject: `📊 Relatório Semanal OssTrack — ${fmt(segunda)} a ${fmt(sexta)}`,
      html,
    })

    await prisma.cronLog.create({ data: { tipo: "relatorio-semanal" } }).catch(() => {})

    return NextResponse.json({
      ok: true,
      periodo: `${fmt(segunda)} a ${fmt(sexta)}`,
      novosAlunos,
      novosProfessores,
      presencasSemana,
      alunosAtivos: alunosAtivos.length,
      valorRecebido,
      pagas,
      totalAlunos,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

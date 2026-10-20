import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import prisma from "@/lib/prisma"
import { verifyCronAuth } from "@/lib/cron-auth"

const SMTP_HOST = process.env.SMTP_HOST || "smtpout.secureserver.net"
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10)
const SMTP_USER = process.env.SMTP_USER || "passador@osstrack.com"
const SMTP_PASS = process.env.SMTP_PASS
const FROM_EMAIL = process.env.FROM_EMAIL || "passador@osstrack.com"
const FROM_NAME = process.env.FROM_NAME || "OssTrack"
const REPORT_TO = process.env.REPORT_TO || "gustavorotatori@gmail.com"

export async function GET(request: Request) {
  const authError = await verifyCronAuth(request)
  if (authError) return authError

  if (!SMTP_PASS) {
    return NextResponse.json({ error: "SMTP_PASS not configured" }, { status: 500 })
  }

  try {
    const doisDiasAtras = new Date(Date.now() - 48 * 60 * 60 * 1000)

    const [novosAlunos, novosProfessores, novosDonos, novasAcademias, novosLeads, emailsEnviados, emailsAbertos, emailsClicados, autoReplies] =
      await Promise.all([
        prisma.usuario.count({
          where: { role: "ALUNO", createdAt: { gte: doisDiasAtras } },
        }),
        prisma.usuario.count({
          where: { role: "PROFESSOR", createdAt: { gte: doisDiasAtras } },
        }),
        prisma.usuario.count({
          where: { role: "DONO", createdAt: { gte: doisDiasAtras } },
        }),
        prisma.academia.count({
          where: { createdAt: { gte: doisDiasAtras } },
        }),
        prisma.lead.count({
          where: { createdAt: { gte: doisDiasAtras } },
        }),
        prisma.outreachSent.count({
          where: { sentAt: { gte: doisDiasAtras } },
        }),
        prisma.outreachSent.count({
          where: { openedAt: { gte: doisDiasAtras } },
        }),
        prisma.outreachSent.count({
          where: { clickedAt: { gte: doisDiasAtras } },
        }),
        prisma.autoReplyLog.count({
          where: { processedAt: { gte: doisDiasAtras } },
        }),
      ])

    const [totalAlunos, totalAcademias, totalOutreach, totalAbertos, totalClicados] = await Promise.all([
      prisma.usuario.count({ where: { role: "ALUNO" } }),
      prisma.academia.count(),
      prisma.outreachSent.count(),
      prisma.outreachSent.count({ where: { openedAt: { not: null } } }),
      prisma.outreachSent.count({ where: { clickedAt: { not: null } } }),
    ])

    const naoAbertos = totalOutreach - totalAbertos
    const taxaAbertura = totalOutreach > 0 ? Math.round((totalAbertos / totalOutreach) * 100) : 0
    const taxaClique = totalAbertos > 0 ? Math.round((totalClicados / totalAbertos) * 100) : 0

    const dados = {
      novosAlunos,
      novosProfessores,
      novosDonos,
      novasAcademias,
      novosLeads,
      emailsEnviados,
      emailsAbertos,
      emailsClicados,
      autoReplies,
      totalAlunos,
      totalAcademias,
      totalOutreach,
      totalAbertos,
      totalClicados,
      naoAbertos,
      taxaAbertura,
      taxaClique,
    }

    await prisma.relatorioEnvio.create({
      data: { tipo: "relatorio-2dias", dados: dados as object },
    })

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  body { font-family: -apple-system, sans-serif; background: #0a0a0a; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 0 auto; padding: 32px 24px; }
  .logo { text-align: center; font-size: 24px; font-weight: 900; background: linear-gradient(135deg, #c9a84c, #f5d77b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px; }
  .card { background: #141414; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px; }
  h2 { color: #fff; font-size: 18px; margin: 0 0 16px; }
  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
  .stat { background: #1a1a1a; border-radius: 12px; padding: 16px; text-align: center; }
  .stat-num { font-size: 28px; font-weight: 800; color: #c9a84c; }
  .stat-label { font-size: 12px; color: #888; margin-top: 4px; }
  .divider { border-top: 1px solid #222; margin: 20px 0; }
  .section { color: #ccc; font-size: 14px; margin: 8px 0; }
  .section strong { color: #fff; }
  .alert { background: #2a1a1a; border: 1px solid #442222; border-radius: 8px; padding: 12px; color: #ff8888; font-size: 13px; margin: 12px 0; }
  .good { color: #88ff88; }
  .warn { color: #ffaa44; }
</style></head><body>
<div class="container">
  <div class="logo">OssTrack — Relatório</div>
  <div class="card">
    <h2>📊 Últimos 2 dias</h2>

    <div class="stat-grid">
      <div class="stat"><div class="stat-num">${novosAlunos}</div><div class="stat-label">Novos Alunos</div></div>
      <div class="stat"><div class="stat-num">${novosProfessores}</div><div class="stat-label">Novos Professores</div></div>
      <div class="stat"><div class="stat-num">${novosDonos}</div><div class="stat-label">Novos Donos</div></div>
      <div class="stat"><div class="stat-num">${novasAcademias}</div><div class="stat-label">Novas Academias</div></div>
    </div>

    <div class="divider"></div>
    <h2>📧 Prospecção (Outreach)</h2>
    <div class="section">Enviados: <strong>${emailsEnviados}</strong></div>
    <div class="section">Abertos: <strong>${emailsAbertos}</strong> <span class="${taxaAbertura > 30 ? "good" : "warn"}">(${taxaAbertura}%)</span></div>
    <div class="section">Cliques: <strong>${emailsClicados}</strong> <span class="${taxaClique > 10 ? "good" : "warn"}">(${taxaClique}%)</span></div>
    <div class="section">Auto-respostas: <strong>${autoReplies}</strong></div>

    ${naoAbertos > 0 ? `<div class="alert">⚠️ ${naoAbertos} emails NÃO abertos de ${totalOutreach} enviados</div>` : ""}

    <div class="divider"></div>
    <h2>📈 Totais Gerais</h2>
    <div class="section">Total de alunos: <strong>${totalAlunos}</strong></div>
    <div class="section">Total de academias: <strong>${totalAcademias}</strong></div>
    <div class="section">Outreach enviado: <strong>${totalOutreach}</strong></div>
    <div class="section">Taxa de abertura: <strong>${taxaAbertura}%</strong></div>
    <div class="section">Taxa de clique: <strong>${taxaClique}%</strong></div>
  </div>
</div></body></html>`

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: REPORT_TO,
      subject: `OssTrack — Relatório: ${novosAlunos} alunos, ${novasAcademias} academias (2 dias)`,
      html,
    })

    return NextResponse.json({ ok: true, ...dados })
  } catch {
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

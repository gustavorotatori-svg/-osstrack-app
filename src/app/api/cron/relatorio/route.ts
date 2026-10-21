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

    const [novosAlunos, novosProfessores, novosDonos, novasAcademias, novosLeads, emailsEnviados, emailsAbertos, emailsClicados, emailsBounced, autoReplies, pageViews2d] =
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
        prisma.outreachSent.count({
          where: { bouncedAt: { gte: doisDiasAtras } },
        }),
        prisma.autoReplyLog.count({
          where: { processedAt: { gte: doisDiasAtras } },
        }),
        prisma.pageView.count({
          where: { createdAt: { gte: doisDiasAtras } },
        }),
      ])

    const [totalAlunos, totalAcademias, totalOutreach, totalAbertos, totalClicados, totalBounced, totalPageViews, visitantesUnicos] = await Promise.all([
      prisma.usuario.count({ where: { role: "ALUNO" } }),
      prisma.academia.count(),
      prisma.outreachSent.count(),
      prisma.outreachSent.count({ where: { openedAt: { not: null } } }),
      prisma.outreachSent.count({ where: { clickedAt: { not: null } } }),
      prisma.outreachSent.count({ where: { bouncedAt: { not: null } } }),
      prisma.pageView.count(),
      prisma.pageView.findMany({
        where: { createdAt: { gte: doisDiasAtras } },
        select: { ip: true },
        distinct: ["ip"],
      }).then(r => r.length),
    ])

    const entregues = totalOutreach - totalBounced
    const naoAbertos = entregues - totalAbertos
    const taxaEntrega = totalOutreach > 0 ? Math.round((entregues / totalOutreach) * 100) : 0
    const taxaAbertura = entregues > 0 ? Math.round((totalAbertos / entregues) * 100) : 0
    const taxaClique = totalAbertos > 0 ? Math.round((totalClicados / totalAbertos) * 100) : 0

    const topPages = await prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: doisDiasAtras } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 5,
    })

    const bouncedList = await prisma.outreachSent.findMany({
      where: { bouncedAt: { not: null } },
      select: { email: true, nome: true, cidade: true, bounceReason: true },
      orderBy: { bouncedAt: "desc" },
      take: 10,
    })

    const naoAbertosList = await prisma.outreachSent.findMany({
      where: { bouncedAt: null, openedAt: null },
      select: { email: true, nome: true, cidade: true, estado: true },
      take: 20,
    })

    const dados = {
      novosAlunos, novosProfessores, novosDonos, novasAcademias, novosLeads,
      emailsEnviados, emailsAbertos, emailsClicados, emailsBounced, autoReplies,
      pageViews2d, visitantesUnicos,
      totalAlunos, totalAcademias, totalOutreach, totalAbertos, totalClicados, totalBounced,
      totalPageViews, entregues, naoAbertos,
      taxaEntrega, taxaAbertura, taxaClique,
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
  .good { color: #88ff88; }
  .warn { color: #ffaa44; }
  .bad { color: #ff6666; }
  .list { font-size: 12px; color: #888; margin: 8px 0; }
  .list li { margin: 4px 0; }
</style></head><body>
<div class="container">
  <div class="logo">OssTrack — Relatório</div>
  <div class="card">
    <h2>👥 Novos Usuários (2 dias)</h2>
    <div class="stat-grid">
      <div class="stat"><div class="stat-num">${novosAlunos}</div><div class="stat-label">Alunos</div></div>
      <div class="stat"><div class="stat-num">${novosProfessores}</div><div class="stat-label">Professores</div></div>
      <div class="stat"><div class="stat-num">${novosDonos}</div><div class="stat-label">Donos</div></div>
      <div class="stat"><div class="stat-num">${novasAcademias}</div><div class="stat-label">Academias</div></div>
    </div>

    <div class="divider"></div>
    <h2>🌐 Visitas (2 dias)</h2>
    <div class="stat-grid">
      <div class="stat"><div class="stat-num">${pageViews2d}</div><div class="stat-label">Page Views</div></div>
      <div class="stat"><div class="stat-num">${visitantesUnicos}</div><div class="stat-label">Visitantes Únicos</div></div>
    </div>
    ${topPages.length > 0 ? `<ul class="list">${topPages.map(p => `<li>${p.path}: ${p._count.path} views</li>`).join("")}</ul>` : ""}

    <div class="divider"></div>
    <h2>📧 Prospecção</h2>
    <div class="section">Enviados: <strong>${totalOutreach}</strong></div>
    <div class="section">Entregues: <strong class="${taxaEntrega > 90 ? "good" : "bad"}">${entregues}</strong> (${taxaEntrega}%)</div>
    <div class="section">Bounced (falharam): <strong class="${totalBounced > 0 ? "bad" : "good"}">${totalBounced}</strong></div>
    <div class="section">Abertos: <strong>${totalAbertos}</strong> <span class="${taxaAbertura > 30 ? "good" : "warn"}">(${taxaAbertura}% dos entregues)</span></div>
    <div class="section">Cliques: <strong>${totalClicados}</strong> <span class="${taxaClique > 10 ? "good" : "warn"}">(${taxaClique}%)</span></div>
    <div class="section">Não abertos: <strong class="warn">${naoAbertos}</strong></div>
    <div class="section">Auto-respostas: <strong>${autoReplies}</strong></div>

    ${bouncedList.length > 0 ? `
    <div class="divider"></div>
    <h2>❌ Bounced (não entregues)</h2>
    <ul class="list">${bouncedList.map(b => `<li>${b.email} (${b.nome}, ${b.cidade})</li>`).join("")}</ul>
    ` : ""}

    ${naoAbertosList.length > 0 ? `
    <div class="divider"></div>
    <h2>📭 Não Abertos</h2>
    <ul class="list">${naoAbertosList.map(n => `<li>${n.email} (${n.nome}, ${n.cidade}/${n.estado})</li>`).join("")}</ul>
    ` : ""}

    <div class="divider"></div>
    <h2>📈 Totais</h2>
    <div class="section">Alunos: <strong>${totalAlunos}</strong></div>
    <div class="section">Academias: <strong>${totalAcademias}</strong></div>
    <div class="section">Page Views total: <strong>${totalPageViews}</strong></div>
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
      subject: `OssTrack: ${novosAlunos} alunos | ${pageViews2d} visitas | ${taxaEntrega}% entrega | ${totalBounced} bounced`,
      html,
    })

    return NextResponse.json({ ok: true, ...dados })
  } catch {
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

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
const DAILY_LIMIT = 10

const ACADEMIAS = [
  { nome: "Centro de Treinamento Sow", email: "sowespbjj@gmail.com", cidade: "Barbalha", estado: "CE" },
  { nome: "CT Edilania Andrade", email: "ctedilaniaandrade@gmail.com", cidade: "Juazeiro do Norte", estado: "CE" },
  { nome: "Escola ALJ Jiu-Jitsu", email: "academiaalj1@gmail.com", cidade: "Jaguaretama", estado: "CE" },
  { nome: "Team David Lemos BJJ", email: "joaodavidas@gmail.com", cidade: "Alto Santo", estado: "CE" },
  { nome: "SER Jiu-Jitsu", email: "serjiujitsuteam@gmail.com", cidade: "Eusébio", estado: "CE" },
  { nome: "Escola LSS de Jiu-Jitsu", email: "leandroserra69@gmail.com", cidade: "Caruaru", estado: "PE" },
  { nome: "Junior Team BJJ", email: "junioroliveirasbu@gmail.com", cidade: "São Bento do Una", estado: "PE" },
  { nome: "Durão Combat Team", email: "duraocombatteammatriz@gmail.com", cidade: "Olinda", estado: "PE" },
  { nome: "Stallone Team", email: "decostallone27@gmail.com", cidade: "Paulista", estado: "PE" },
  { nome: "CT 073", email: "l.polon@yahoo.com.br", cidade: "Prado", estado: "BA" },
  { nome: "Essence Jiu Jitsu", email: "contato@essencejiujitsu.com", cidade: "Sete Lagoas", estado: "MG" },
  { nome: "CT WR", email: "surfoquee@gmail.com", cidade: "Viçosa", estado: "MG" },
  { nome: "Paulão Rezende Academia", email: "paulaorezenderede006@gmail.com", cidade: "Poços de Caldas", estado: "MG" },
  { nome: "Fifty Fight", email: "contato@fiftyfight.com.br", cidade: "Sorocaba", estado: "SP" },
  { nome: "CT Familiar", email: "contato@ctfamiliar.com.br", cidade: "Paulínia", estado: "SP" },
  { nome: "Training Center Viscardi Andrade", email: "ctviscardiandrade@gmail.com", cidade: "Mirandópolis", estado: "SP" },
  { nome: "Mendes Jiu Jitsu Academy", email: "mendesjj@icloud.com", cidade: "Rio Claro", estado: "SP" },
  { nome: "Gomes Brothers Jiu-Jitsu", email: "dfgpmesvh@gmail.com", cidade: "Aparecida", estado: "SP" },
  { nome: "023 School of Jiu-Jitsu", email: "023schoolofjiujitsu@gmail.com", cidade: "Regente Feijó", estado: "SP" },
  { nome: "Titã Centro de Treinamento", email: "titacentrodetreinamento@gmail.com", cidade: "Passo Fundo", estado: "RS" },
  { nome: "Barden BJJ", email: "bardenbjj@gmail.com", cidade: "Sapucaia do Sul", estado: "RS" },
  { nome: "Centro de Jiu Jitsu Farroupilha", email: "cjfarroupilha@gmail.com", cidade: "Farroupilha", estado: "RS" },
  { nome: "Monte Team Pomerode", email: "joaoduarteencarnacao@hotmail.com", cidade: "Pomerode", estado: "SC" },
  { nome: "Monte Team Taió", email: "netozx8@hotmail.com", cidade: "Taió", estado: "SC" },
  { nome: "Talibã Jiu-Jitsu", email: "talibabjj@gmail.com", cidade: "São Miguel do Oeste", estado: "SC" },
  { nome: "Araújo Jiu-Jitsu Imbuia", email: "araxande14@hotmail.com", cidade: "Imbuia", estado: "SC" },
  { nome: "Omnium Tribuum Jiu-Jitsu", email: "omniumtribuum@gmail.com", cidade: "Cáceres", estado: "MT" },
  { nome: "Monte Team Itaituba", email: "montejiujitsu.itb2019@gmail.com", cidade: "Itaituba", estado: "PA" },
  { nome: "SL Jiu-Jitsu", email: "contato@sljiujitsu.com", cidade: "São Gabriel do Oeste", estado: "MS" },
  { nome: "Toca do Urso", email: "tocadoursojiu@hotmail.com", cidade: "Ponta Porã", estado: "MS" },
  { nome: "Fusão Escola de Jiu-Jitsu", email: "rogeriomoreirabjj.rm@gmail.com", cidade: "Paço do Lumiar", estado: "MA" },
  { nome: "CT G2", email: "petersonprocopio87@gmail.com", cidade: "São José de Ribamar", estado: "MA" },
  { nome: "Halfão Martins Academy", email: "halfaobjj@gmail.com", cidade: "Colatina", estado: "ES" },
  { nome: "FC Combate", email: "fccombate.jj@gmail.com", cidade: "Vila Velha", estado: "ES" },
  { nome: "CTE Domo", email: "contato@ctedomo.com.br", cidade: "Vitória", estado: "ES" },
  { nome: "Studio HR Jiu Jitsu Academy", email: "heliorezendelima@gmail.com", cidade: "Tefé", estado: "AM" },
]

function renderEmail(nome: string, cidade: string, trackingId: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 0 auto; padding: 32px 24px; }
  .logo { text-align: center; font-size: 28px; font-weight: 900; background: linear-gradient(135deg, #c9a84c, #f5d77b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
  .card { background: #141414; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 32px; }
  h1 { font-size: 22px; font-weight: 800; color: #fff; margin: 0 0 12px; }
  p { font-size: 15px; color: #a0a0a0; line-height: 1.6; margin: 0 0 20px; }
  .btn { display: inline-block; background: linear-gradient(135deg, #c9a84c, #f5d77b); color: #000; font-weight: 800; font-size: 14px; padding: 12px 28px; border-radius: 12px; text-decoration: none; }
  .features { background: #1a1a1a; border-radius: 12px; padding: 20px; margin: 20px 0; }
  .feature { font-size: 14px; color: #ccc; margin: 8px 0; padding-left: 24px; position: relative; }
  .feature::before { content: "\\2713"; position: absolute; left: 0; color: #c9a84c; font-weight: bold; }
  .footer { text-align: center; padding: 24px 0 0; font-size: 12px; color: #555; }
  .unsubscribe { text-align: center; padding: 16px 0 0; font-size: 11px; color: #444; }
  .unsubscribe a { color: #666; }
</style></head><body>
<div class="container">
  <div class="logo">OssTrack</div>
  <div class="card">
    <h1>Olá, ${nome}! 👋</h1>
    <p>Vi que vocês têm uma academia de Jiu-Jitsu em ${cidade} e queria apresentar uma ferramenta que pode ajudar no dia a dia de vocês.</p>
    <p><strong>O OssTrack é 100% gratuito</strong> — uma plataforma completa para gerenciar sua academia:</p>
    <div class="features">
      <div class="feature">Check-in com geolocalização e QR code</div>
      <div class="feature">Controle de frequência e presenças</div>
      <div class="feature">Sistema de graduação e faixas</div>
      <div class="feature">Dashboard para dono e professores</div>
      <div class="feature">Mural de avisos e agenda de turmas</div>
      <div class="feature">PWA — funciona como app no celular</div>
      <div class="feature">Suporte a 14 idiomas</div>
    </div>
    <p>Sem custos, sem contratos, sem pegadinhas. Apenas crie uma conta e comece a usar.</p>
    <p style="text-align:center"><a class="btn" href="https://osstrack.com.br/api/cron/outreach/click?id=${trackingId}">Criar Conta Grátis</a></p>
    <p style="font-size:13px; color:#666; text-align:center">Qualquer dúvida, é só responder este email.</p>
  </div>
  <div class="footer">OssTrack — Sua jornada no tatame começa aqui.</div>
  <div class="unsubscribe">Se não quiser mais receber emails, <a href="mailto:passador@osstrack.com?subject=Remover">clique aqui</a>.</div>
  <img src="https://osstrack.com.br/api/cron/outreach/open?id=${trackingId}" width="1" height="1" alt="" style="display:none">
</div></body></html>`
}

export async function GET(request: Request) {
  const authError = await verifyCronAuth(request)
  if (authError) return authError

  if (!SMTP_PASS) {
    return NextResponse.json({ error: "SMTP_PASS not configured" }, { status: 500 })
  }

  try {
    const sentEmails = await prisma.outreachSent.findMany({
      select: { email: true },
    })
    const sentSet = new Set(sentEmails.map((s) => s.email))

    const pending = ACADEMIAS.filter((a) => !sentSet.has(a.email)).slice(0, DAILY_LIMIT)

    if (pending.length === 0) {
      return NextResponse.json({ message: "All academies contacted", totalSent: sentSet.size })
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })

    let ok = 0
    let fail = 0

    for (const academia of pending) {
      try {
        const record = await prisma.outreachSent.create({
          data: { email: academia.email, nome: academia.nome, cidade: academia.cidade, estado: academia.estado },
        })

        await transporter.sendMail({
          from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
          to: academia.email,
          subject: "OssTrack — Plataforma gratuita para sua academia de Jiu-Jitsu",
          html: renderEmail(academia.nome, academia.cidade, record.id),
        })

        ok++
      } catch {
        fail++
      }
      await new Promise((r) => setTimeout(r, 2000))
    }

    return NextResponse.json({
      sent: ok,
      failed: fail,
      totalContacted: sentSet.size + ok,
      remaining: ACADEMIAS.length - sentSet.size - ok,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send emails" }, { status: 500 })
  }
}

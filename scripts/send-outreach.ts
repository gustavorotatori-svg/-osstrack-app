import nodemailer, { type Transporter } from "nodemailer"
import { readFileSync, writeFileSync, existsSync } from "fs"
import { resolve } from "path"

const SMTP_HOST = process.env.SMTP_HOST || "smtpout.secureserver.net"
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10)
const SMTP_USER = process.env.SMTP_USER || "passador@osstrack.com"
const SMTP_PASS = process.env.SMTP_PASS
const FROM_EMAIL = process.env.FROM_EMAIL || "passador@osstrack.com"
const FROM_NAME = process.env.FROM_NAME || "OssTrack"
const DAILY_LIMIT = parseInt(process.env.DAILY_LIMIT || "10", 10)

interface Academy {
  nome: string
  email: string
  cidade?: string
  estado?: string
}

interface SentLog {
  sent: string[]
  lastSent: string
  totalSent: number
}

function loadAcademias(): Academy[] {
  const file = resolve(__dirname, "academias.json")
  if (!existsSync(file)) {
    console.error("Arquivo academias.json não encontrado")
    process.exit(1)
  }
  return JSON.parse(readFileSync(file, "utf-8"))
}

function loadSentLog(): SentLog {
  const file = resolve(__dirname, "sent.json")
  if (!existsSync(file)) {
    return { sent: [], lastSent: "", totalSent: 0 }
  }
  return JSON.parse(readFileSync(file, "utf-8"))
}

function saveSentLog(log: SentLog) {
  const file = resolve(__dirname, "sent.json")
  writeFileSync(file, JSON.stringify(log, null, 2))
}

function renderEmail(academia: Academy): string {
  const cidade = academia.cidade || "sua cidade"
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
    <h1>Olá, ${academia.nome}! 👋</h1>
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
    <p style="text-align:center"><a class="btn" href="https://osstrack.com.br/cadastro">Criar Conta Grátis</a></p>
    <p style="font-size:13px; color:#666; text-align:center">Qualquer dúvida, é só responder este email.</p>
  </div>
  <div class="footer">OssTrack — Sua jornada no tatame começa aqui.</div>
  <div class="unsubscribe">Se não quiser mais receber emails, <a href="mailto:passador@osstrack.com?subject=Remover">clique aqui</a>.</div>
</div></body></html>`
}

async function sendOne(academia: Academy, transporter: Transporter): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: academia.email,
      subject: `OssTrack — Plataforma gratuita para sua academia de Jiu-Jitsu`,
      html: renderEmail(academia),
    })
    console.log(`✓ ${academia.nome} <${academia.email}>`)
    return true
  } catch (err) {
    console.error(`✗ ${academia.nome} <${academia.email}> —`, err instanceof Error ? err.message : err)
    return false
  }
}

async function main() {
  if (!SMTP_PASS) {
    console.error("Defina SMTP_PASS")
    process.exit(1)
  }

  const academias = loadAcademias()
  const sentLog = loadSentLog()
  const sentSet = new Set(sentLog.sent)

  const pending = academias.filter((a) => !sentSet.has(a.email))
  console.log(`Total: ${academias.length} | Já enviados: ${sentLog.sent.length} | Pendentes: ${pending.length}`)

  if (pending.length === 0) {
    console.log("Nenhuma academia pendente!")
    return
  }

  const toSend = pending.slice(0, DAILY_LIMIT)
  console.log(`Enviando até ${toSend.length} hoje (limite: ${DAILY_LIMIT})\n`)

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })

  await transporter.verify()
  console.log("SMTP conectado!\n")

  let ok = 0
  let fail = 0
  for (const academia of toSend) {
    const success = await sendOne(academia, transporter)
    if (success) {
      ok++
      sentLog.sent.push(academia.email)
    } else {
      fail++
    }
    await new Promise((r) => setTimeout(r, 2000))
  }

  sentLog.lastSent = new Date().toISOString().split("T")[0]
  sentLog.totalSent += ok
  saveSentLog(sentLog)

  console.log(`\n${ok} enviados, ${fail} falharam`)
  console.log(`Progresso: ${sentLog.sent.length}/${academias.length} academias alcançadas`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

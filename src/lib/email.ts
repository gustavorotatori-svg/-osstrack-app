import nodemailer from "nodemailer"

const smtpHost = process.env.SMTP_HOST
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10)
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const fromEmail = process.env.EMAIL_FROM || "noreply@osstrack.app"
const fromName = process.env.EMAIL_FROM_NAME || "OssTrack"

function getTransporter() {
  if (!smtpHost || !smtpUser || !smtpPass) return null
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  })
}

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn("[email] SMTP not configured — skipping email to", params.to)
    return { sent: false, reason: "SMTP_NOT_CONFIGURED" }
  }
  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: params.to,
      subject: params.subject,
      text: params.text || params.html.replace(/<[^>]*>/g, ""),
      html: params.html,
    })
    return { sent: true }
  } catch (error) {
    console.error("[email] send error:", error)
    return { sent: false, reason: "SEND_FAILED" }
  }
}

export function renderEmailLayout(title: string, body: string, cta?: { label: string; url: string }) {
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
  .footer { text-align: center; padding: 24px 0 0; font-size: 12px; color: #555; }
</style></head><body>
<div class="container">
  <div class="logo">OssTrack</div>
  <div class="card">
    <h1>${title}</h1>
    <p>${body}</p>
    ${cta ? `<p style="text-align:center"><a class="btn" href="${cta.url}">${cta.label}</a></p>` : ""}
  </div>
  <div class="footer">OssTrack — Sua jornada no tatame começa aqui.</div>
</div></body></html>`
}
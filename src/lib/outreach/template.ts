export function renderEmail(nome: string, cidade: string, trackingId: string): string {
  const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))
  nome = escape(nome)
  cidade = escape(cidade)
  trackingId = encodeURIComponent(trackingId)
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

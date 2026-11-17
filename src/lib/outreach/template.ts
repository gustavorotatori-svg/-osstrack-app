function escape(value: string) {
  return value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!))
}

function content(nome: string, cidade: string, personalization: string, personalizedQuestion: string, clickUrl: string, unsubscribeUrl: string) {
  return [
    `Olá, ${nome}.`,
    "",
    personalization && personalizedQuestion
      ? `Vi que ${personalization}. ${personalizedQuestion}`
      : `Encontrei o contato público da academia e queria perguntar: como vocês organizam hoje turmas, alunos e presenças?`,
    "",
    "Estou à frente do OssTrack, uma plataforma gratuita para academias pequenas e médias de Jiu-Jitsu organizarem turmas, alunos e presenças, sem mensalidade.",
    `Se esse controle ainda dá trabalho por aí em ${cidade}, posso te mostrar em 10 minutos. Quer que eu envie um acesso?`,
    "",
    `Se preferir, veja a plataforma: ${clickUrl}`,
    "",
    "Abraço,",
    "Gustavo | OssTrack",
    "",
    `Para não receber novos emails, responda “remover” ou use: ${unsubscribeUrl}`,
  ].join("\n")
}

export function renderText(nome: string, cidade: string, trackingId: string, personalization: string, personalizedQuestion: string) {
  const id = encodeURIComponent(trackingId)
  return content(nome, cidade, personalization || "", personalizedQuestion || "",
    `https://osstrack.com.br/api/cron/outreach/click?id=${id}`,
    "mailto:passador@osstrack.com?subject=Remover")
}

export function renderEmail(nome: string, cidade: string, trackingId: string, personalization: string, personalizedQuestion: string): string {
  const id = encodeURIComponent(trackingId)
  const clickUrl = `https://osstrack.com.br/api/cron/outreach/click?id=${id}`
  const unsubscribeUrl = "mailto:passador@osstrack.com?subject=Remover"
  return `<!doctype html><html><body style="margin:0;padding:20px;font:15px/1.55 Arial,sans-serif;color:#202124;background:#fff"><main style="max-width:560px;margin:0 auto">
<p>Olá, ${escape(nome)}.</p>
<p>${personalization && personalizedQuestion
  ? `Vi que ${escape(personalization)}. ${escape(personalizedQuestion)}`
  : "Encontrei o contato público da academia e queria perguntar: como vocês organizam hoje turmas, alunos e presenças?"}</p>
<p>Estou à frente do OssTrack, uma plataforma gratuita para academias pequenas e médias de Jiu-Jitsu organizarem turmas, alunos e presenças, sem mensalidade.</p>
<p>Se esse controle ainda dá trabalho por aí em ${escape(cidade)}, posso te mostrar em 10 minutos. Quer que eu envie um acesso?</p>
<p>Se preferir, <a href="${escape(clickUrl)}">veja a plataforma</a>.</p>
<p>Abraço,<br>Gustavo | OssTrack</p>
<p style="font-size:12px;color:#666">Para não receber novos emails, responda “remover” ou <a href="${escape(unsubscribeUrl)}">use este link</a>.</p>
<img src="https://osstrack.com.br/api/cron/outreach/open?id=${id}" width="1" height="1" alt="" style="display:none"></main></body></html>`
}

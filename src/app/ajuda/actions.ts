"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/lib/email"

function esc(valor: string) {
  return valor.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

export async function enviarContato(formData: FormData) {
  const nome = formData.get("nome")?.toString().trim()
  const email = formData.get("email")?.toString().trim()
  const mensagem = formData.get("mensagem")?.toString().trim()
  const consentimento = formData.get("consentimento")?.toString()

  if (!nome || !email || !mensagem || !consentimento) return

  try {
    await prisma.contato.create({
      data: { nome, email, mensagem },
    })
  } catch {
    // silently ignore
  }

  const html = `
    <div style="font-family:-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1a1a1a">
      <h2 style="margin:0 0 16px">Novo contato via Fale Conosco</h2>
      <p><strong>Nome:</strong> ${esc(nome)}</p>
      <p><strong>E-mail:</strong> ${esc(email)}</p>
      <p><strong>Mensagem:</strong></p>
      <p style="background:#f5f5f0;padding:16px;border-radius:12px">${esc(mensagem)}</p>
    </div>`

  try {
    await Promise.race([
      sendEmail({ to: "passador@osstrack.com", subject: `Contato pelo site — ${nome}`, html }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("SMTP_TIMEOUT")), 8000)),
    ])
  } catch {
    // non-critical
  }

  revalidatePath("/ajuda")
}

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const { email, recaptchaToken } = await request.json()
    if (!email) return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })

    if (process.env.RECAPTCHA_SECRET_KEY) {
      if (!recaptchaToken) {
        return NextResponse.json({ error: "reCAPTCHA é obrigatório" }, { status: 400 })
      }
      const params = new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY, response: recaptchaToken })
      const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", { method: "POST", body: params })
      const verifyData = await verifyRes.json()
      if (!verifyData.success || (verifyData.score && verifyData.score < 0.5)) {
        return NextResponse.json({ error: "Falha na verificação de segurança. Tente novamente." }, { status: 400 })
      }
    }

    // Rate limit by IP and email
    const ip = getClientIp(request)
    const ipCheck = await checkRateLimit(`ip:${ip}`, "recuperar-senha")
    if (!ipCheck.allowed) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente em 1 minuto." }, { status: 429 })
    }

    const emailCheck = await checkRateLimit(`email:${email}`, "recuperar-senha")
    if (!emailCheck.allowed) {
      return NextResponse.json({ error: "Muitas tentativas para este e-mail. Tente novamente em 1 minuto." }, { status: 429 })
    }

    const user = await prisma.usuario.findUnique({ where: { email } })
    if (!user) {
      // Always return success to prevent email enumeration
      return NextResponse.json({ success: true, message: "Se o email existir, você receberá um link de recuperação." })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.usuario.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpires: expires },
    })

    // Retorna URL em vez do token bruto para evitar vazamento no JS frontend
    const resetUrl = `${new URL(request.url).origin}/redefinir-senha?token=${token}`
    return NextResponse.json({ success: true, resetUrl, message: "Link gerado! Clique abaixo para redefinir." })
  } catch {
    return NextResponse.json({ error: "Erro ao gerar token" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const { token, senha, recaptchaToken } = await request.json()
    if (!token || !senha) return NextResponse.json({ error: "Token e senha são obrigatórios" }, { status: 400 })
    if (senha.length < 8) return NextResponse.json({ error: "Senha deve ter no mínimo 8 caracteres" }, { status: 400 })

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

    const ip = getClientIp(request)
    const ipCheck = await checkRateLimit(`ip:${ip}`, "redefinir-senha")
    if (!ipCheck.allowed) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente em 1 minuto." }, { status: 429 })
    }

    const user = await prisma.usuario.findFirst({
      where: { resetToken: token, resetTokenExpires: { gt: new Date() } },
    })

    if (!user) return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })

    const senhaHash = await bcrypt.hash(senha, 10)
    await prisma.usuario.update({
      where: { id: user.id },
      data: { senha: senhaHash, resetToken: null, resetTokenExpires: null },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro ao redefinir senha" }, { status: 500 })
  }
}

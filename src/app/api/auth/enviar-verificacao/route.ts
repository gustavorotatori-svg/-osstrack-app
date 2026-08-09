import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { sendEmail } from "@/lib/email"
import crypto from "crypto"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    // Rate limit para evitar spam
    const ipCheck = await checkRateLimit(`email_verify:${session.user.id}`, "enviar-verificacao")
    if (!ipCheck.allowed) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente em 1 minuto." }, { status: 429 })
    }

    const token = crypto.randomBytes(32).toString("hex")

    await prisma.usuario.update({
      where: { id: session.user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://osstrack.com.br"}/api/auth/verificar-email?token=${token}&userId=${session.user.id}`

    await sendEmail({
      to: session.user.email!,
      subject: "Confirme seu email - OssTrack",
      html: `<div style="max-width:480px;margin:0 auto;font-family:sans-serif">
        <h2 style="color:#d4a847">Confirme seu email</h2>
        <p>Olá ${session.user.name},</p>
        <p>Clique no link abaixo para confirmar seu email no OssTrack:</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#d4a847;color:#000;text-decoration:none;border-radius:8px;font-weight:bold">Confirmar Email</a>
        <p style="margin-top:24px;color:#666;font-size:12px">Se você não solicitou esta verificação, ignore este email.</p>
      </div>`,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return handleApiError(error)
  }
}

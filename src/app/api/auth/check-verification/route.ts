import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { emailSchema } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = emailSchema.safeParse(body.email)
    if (!parsed.success) {
      return NextResponse.json({ verified: true })
    }
    const email = parsed.data

    const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
    if (!smtpConfigured) {
      return NextResponse.json({ verified: true })
    }

    const user = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { emailVerified: true },
    })

    if (!user) {
      return NextResponse.json({ verified: true })
    }

    return NextResponse.json({ verified: !!user.emailVerified })
  } catch {
    return NextResponse.json({ verified: true })
  }
}

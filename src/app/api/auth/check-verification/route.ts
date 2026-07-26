import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ verified: true })
    }

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

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function GET(req: Request) {
  try {
    const ipCheck = await checkRateLimit(`ip:${getClientIp(req)}`, "validar-token-reset")
    if (!ipCheck.allowed) {
      return NextResponse.json({ valid: false })
    }

    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ valid: false })
    }

    const user = await prisma.usuario.findFirst({
      where: { resetToken: token },
      select: { resetTokenExpires: true },
    })

    if (!user || !user.resetTokenExpires) {
      return NextResponse.json({ valid: false })
    }

    if (new Date() > user.resetTokenExpires) {
      return NextResponse.json({ valid: false })
    }

    return NextResponse.json({ valid: true })
  } catch {
    return NextResponse.json({ valid: false })
  }
}

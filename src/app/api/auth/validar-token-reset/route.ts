import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  try {
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

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")
    const userId = searchParams.get("userId")

    if (!token || !userId) {
      return NextResponse.redirect(new URL("/email-confirmado?error=invalid", req.url))
    }

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { emailVerificationToken: true, emailVerificationExpiry: true },
    })

    if (!user || user.emailVerificationToken !== token) {
      return NextResponse.redirect(new URL("/email-confirmado?error=invalid", req.url))
    }

    if (user.emailVerificationExpiry && new Date() > user.emailVerificationExpiry) {
      return NextResponse.redirect(new URL("/email-confirmado?error=expired", req.url))
    }

    await prisma.usuario.update({
      where: { id: userId },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    })

    return NextResponse.redirect(new URL("/email-confirmado?success=true", req.url))
  } catch (error) {
    return handleApiError(error)
  }
}

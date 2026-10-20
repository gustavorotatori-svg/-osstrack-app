import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (id) {
    try {
      await prisma.outreachSent.update({
        where: { id },
        data: { clickedAt: new Date() },
      })
    } catch {}
  }

  return NextResponse.redirect("https://osstrack.com.br/cadastro")
}

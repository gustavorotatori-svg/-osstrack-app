import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    await prisma.$connect()
    const userCount = await prisma.usuario.count()
    return NextResponse.json({ db: "ok", users: userCount })
  } catch (e: any) {
    return NextResponse.json({ db: "error", message: e.message, stack: e.stack?.split("\n").slice(0, 5) }, { status: 500 })
  }
}

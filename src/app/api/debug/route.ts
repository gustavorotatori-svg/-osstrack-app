import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || ""
  const masked = dbUrl.includes("@") ? "***@" + dbUrl.split("@")[1] : "not set"
  try {
    await prisma.$connect()
    const userCount = await prisma.usuario.count()
    return NextResponse.json({ db: "ok", users: userCount, host: masked })
  } catch (e: any) {
    return NextResponse.json({ db: "error", message: e.message, host: masked }, { status: 500 })
  }
}

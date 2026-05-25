import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || ""
  const masked = dbUrl.includes("@") ? "***@" + dbUrl.split("@")[1] : "not set"
  const hostMatch = dbUrl.match(/@([^:]+)/)
  const host = hostMatch ? hostMatch[1] : "unknown"

  // Just check if DATABASE_URL env is correctly set with our value
  return NextResponse.json({
    host,
    startsWithPooler: dbUrl.includes("-pooler"),
    startsWithDirect: dbUrl.includes("npg_WRC4"),
    length: dbUrl.length,
    hasChannelBinding: dbUrl.includes("channel_binding"),
    nodeEnv: process.env.NODE_ENV,
    vercelUrl: process.env.VERCEL_URL,
  })
}

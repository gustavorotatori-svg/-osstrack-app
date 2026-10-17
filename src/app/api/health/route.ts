import { NextResponse } from "next/server"

export async function GET() {
  try {
    const start = Date.now()
    const { default: prisma } = await import("@/lib/prisma")
    await prisma.$queryRaw`SELECT 1`
    const dbLatency = Date.now() - start

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      db: "ok",
      dbLatencyMs: dbLatency,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev",
    })
  } catch {
    return NextResponse.json(
      { status: "error", timestamp: new Date().toISOString(), db: "down" },
      { status: 503 }
    )
  }
}

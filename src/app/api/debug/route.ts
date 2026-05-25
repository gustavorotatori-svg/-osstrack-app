import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? "set" : "not set",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "set" : "not set",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "not set",
      VERCEL_URL: process.env.VERCEL_URL || "not set",
      NODE_ENV: process.env.NODE_ENV || "not set",
      VERCEL: process.env.VERCEL || "not set",
      all: Object.keys(process.env).filter((k) => k.includes("URL") || k.includes("SECRET") || k.includes("VERCEL") || k.includes("NODE") || k.includes("DATABASE")),
    },
  })
}

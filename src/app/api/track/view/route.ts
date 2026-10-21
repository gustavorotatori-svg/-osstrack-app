import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { path, ip, userAgent } = await request.json()

    if (path && typeof path === "string" && path.length < 200) {
      await prisma.pageView.create({
        data: {
          path,
          ip: ip?.slice(0, 45) || null,
          userAgent: userAgent?.slice(0, 500) || null,
        },
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}

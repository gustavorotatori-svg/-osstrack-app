import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

const trackedPaths = new Set(["/", "/cadastro", "/login", "/precos", "/funcionalidades", "/ajuda"])

export async function POST(request: Request) {
  try {
    const { path, ip, userAgent } = await request.json()

    if (typeof path !== "string" || !trackedPaths.has(path) ||
        (ip != null && typeof ip !== "string") || (userAgent != null && typeof userAgent !== "string")) {
      return NextResponse.json({ error: "Evento inválido" }, { status: 400 })
    }

    if (path) {
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

import { NextResponse } from "next/server"
import * as Sentry from "@sentry/nextjs"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const { allowed } = await checkRateLimit(`erro:${ip}`, "erro")
    if (!allowed) return NextResponse.json({ ok: true })

    const body = await request.json().catch(() => null)
    if (body) {
      console.error(
        "[client-error]",
        body.message || "",
        body.url || "",
        body.stack || ""
      )
      if (process.env.SENTRY_DSN) {
        Sentry.captureException(
          new Error(String(body.message || "Client error")),
          {
            extra: {
              url: body.url,
              userAgent: body.userAgent,
              componentStack: body.componentStack,
              stack: body.stack,
            },
          }
        )
      }
    }
  } catch {
    // nunca deixar o report de erro quebrar a requisição
  }
  return NextResponse.json({ ok: true })
}

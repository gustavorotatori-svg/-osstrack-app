import prisma from "./prisma"

const WINDOW_MS = 60 * 1000 // 1 minute window

const LIMITS: Record<string, number> = {
  login: 5,
  register: 3,
  "recuperar-senha": 3,
  "redefinir-senha": 3,
  "enviar-verificacao": 3,
}

export async function checkRateLimit(identifier: string, endpoint: string): Promise<{ allowed: boolean; remaining: number }> {
  const maxAttempts = LIMITS[endpoint]
  if (!maxAttempts) return { allowed: true, remaining: Infinity }

  const now = new Date()
  const windowStart = new Date(now.getTime() - WINDOW_MS)

  const record = await prisma.rateLimitAttempt.findUnique({
    where: { identifier_endpoint: { identifier, endpoint } },
  })

  if (!record || record.windowStart < windowStart) {
    await prisma.rateLimitAttempt.upsert({
      where: { identifier_endpoint: { identifier, endpoint } },
      update: { attempts: 1, windowStart: now },
      create: { identifier, endpoint, attempts: 1, windowStart: now },
    })
    return { allowed: true, remaining: maxAttempts - 1 }
  }

  if (record.attempts >= maxAttempts) {
    return { allowed: false, remaining: 0 }
  }

  await prisma.rateLimitAttempt.update({
    where: { identifier_endpoint: { identifier, endpoint } },
    data: { attempts: { increment: 1 } },
  })

  return { allowed: true, remaining: maxAttempts - record.attempts - 1 }
}

export async function resetRateLimit(identifier: string, endpoint: string): Promise<void> {
  await prisma.rateLimitAttempt.delete({
    where: { identifier_endpoint: { identifier, endpoint } },
  }).catch(() => {})
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return request.headers.get("x-real-ip") || "127.0.0.1"
}

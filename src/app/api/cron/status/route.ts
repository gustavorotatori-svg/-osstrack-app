import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET(req: Request) {
  try {
    const isVercelCron = req.headers.get("x-vercel-cron")
    const isCronWithSecret = process.env.CRON_SECRET && req.headers.get("x-cron-secret") === process.env.CRON_SECRET
    if (!isVercelCron && !isCronWithSecret) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const logs = await prisma.cronLog.findMany({
      orderBy: { rodouEm: "desc" },
      take: 40,
    })

    const porTipo = new Map<string, { total: number; ultima: Date | null }>()
    for (const log of logs) {
      if (!porTipo.has(log.tipo)) porTipo.set(log.tipo, { total: 0, ultima: null })
      const e = porTipo.get(log.tipo)!
      e.total++
      if (!e.ultima || log.rodouEm > e.ultima) e.ultima = log.rodouEm
    }

    return NextResponse.json({
      ok: true,
      tipos: Object.fromEntries(porTipo),
      ultimas: logs.slice(0, 15).map((l) => ({ tipo: l.tipo, rodouEm: l.rodouEm })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

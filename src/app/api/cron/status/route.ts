import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { verifyCronAuth } from "@/lib/cron-auth"

export async function GET(req: Request) {
  try {
    const authError = await verifyCronAuth(req)
    if (authError) return authError

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

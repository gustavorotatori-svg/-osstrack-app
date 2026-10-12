import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function verifyCronAuth(req: Request): Promise<NextResponse | null> {
  const authHeader = req.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    return null
  }

  const session = await getServerSession(authOptions)
  if (session && session.user.role === "dono") {
    return null
  }

  return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
}

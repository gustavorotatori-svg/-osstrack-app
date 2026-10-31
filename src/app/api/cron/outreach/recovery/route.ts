import { NextResponse } from "next/server"
import { cronAuthorized, runOutreach } from "@/lib/outreach/service"
export const runtime = "nodejs"
export const maxDuration = 300
export const dynamic = "force-dynamic"
export async function GET(request: Request) {
  if (!cronAuthorized(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  try { return NextResponse.json(await runOutreach("send")) }
  catch { return NextResponse.json({ error: "outreach_recovery_failed; inspect durable run log" }, { status: 500 }) }
}

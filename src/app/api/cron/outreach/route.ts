import { NextResponse } from "next/server"
import { cronAuthorized, outreachStatus, runOutreach } from "@/lib/outreach/service"
export const runtime = "nodejs"
export const maxDuration = 300
export const dynamic = "force-dynamic"
export async function GET(request: Request) {
  if (!cronAuthorized(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  try {
    const mode = new URL(request.url).searchParams.get("mode")
    if (mode === "status") return NextResponse.json(await outreachStatus())
    return NextResponse.json(await runOutreach("send"))
  } catch { return NextResponse.json({ error: "outreach_run_failed; inspect durable run log" }, { status: 500 }) }
}

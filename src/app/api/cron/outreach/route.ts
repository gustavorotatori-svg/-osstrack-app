import { NextResponse } from "next/server"
import { cronAuthorized, outreachStatus, runOutreach } from "@/lib/outreach/service"
import { cities } from "@/lib/outreach/discovery"
export const runtime = "nodejs"
export const maxDuration = 300
export const dynamic = "force-dynamic"
export async function GET(request: Request) {
  if (!cronAuthorized(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  try {
    const mode = new URL(request.url).searchParams.get("mode")
    if (mode === "status") return NextResponse.json(await outreachStatus())
    if (mode === "source-check") {
      try { return NextResponse.json({ ibge: "ok", eligibleCities: (await cities()).length }) }
      catch (error) { const e = error as Error & { code?: string }; return NextResponse.json({ ibge: "failed", name: e.name, code: e.code, detail: e.message.slice(0, 200) }, { status: 502 }) }
    }
    return NextResponse.json(await runOutreach("send"))
  } catch { return NextResponse.json({ error: "outreach_run_failed; inspect durable run log" }, { status: 500 }) }
}

import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    if (body) {
      console.error(
        "[client-error]",
        body.message || "",
        body.url || "",
        body.stack || ""
      )
    }
  } catch {
    // nunca deixar o report de erro quebrar a requisição
  }
  return NextResponse.json({ ok: true })
}

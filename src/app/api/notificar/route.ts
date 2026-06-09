import { NextResponse } from "next/server"
import { handleApiError } from "@/lib/api-error"

export async function POST() {
  try {
    return NextResponse.json({ ok: true, note: "push notifications disabled" })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE() {
  try {
    return NextResponse.json({ ok: true, note: "push notifications disabled" })
  } catch (error) {
    return handleApiError(error)
  }
}

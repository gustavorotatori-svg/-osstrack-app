import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const qrData = JSON.stringify({
    userId: session.user.id,
    nome: session.user.name,
    academiaId: session.user.academiaId,
    timestamp: Date.now(),
  })

  return NextResponse.json({ qrData, userId: session.user.id })
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { subscription } = await req.json()
  if (!subscription) return NextResponse.json({ error: "subscription é obrigatório" }, { status: 400 })

  await prisma.usuario.update({
    where: { id: session.user.id },
    data: { pushSubscription: JSON.stringify(subscription) },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  await prisma.usuario.update({
    where: { id: session.user.id },
    data: { pushSubscription: null },
  })

  return NextResponse.json({ ok: true })
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import crypto from "crypto"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { tipo } = await request.json()
  if (!tipo || !["professor", "aluno", "amigo"].includes(tipo)) {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
  }

  // aluno role só pode criar convite tipo "amigo"
  if (session.user.role === "aluno" && tipo !== "amigo") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const codigo = crypto.randomBytes(4).toString("hex")
  const baseUrl = process.env.NEXTAUTH_URL || "https://osstrack-app.vercel.app"
  const link = `${baseUrl}/convite/${codigo}`

  await prisma.convite.create({
    data: {
      tipo: tipo === "amigo" ? "aluno" : tipo,
      codigo,
      remetenteId: session.user.id,
      academiaId: session.user.academiaId || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  let msg: string
  if (tipo === "professor") {
    msg = `Olá! Fui convidado(a) a fazer parte da equipe no OssTrack. Acesse ${link} para se cadastrar como professor.`
  } else if (tipo === "amigo") {
    msg = `E aí! Vem treinar comigo! 🥋 Acesse ${link} e se cadastre no OssTrack para acompanharmos nossa evolução juntos.`
  } else {
    msg = `Olá! Seu professor te convidou para treinar conosco. Acesse ${link} e cadastre-se no OssTrack para acompanhar sua evolução.`
  }

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(msg)}`

  return NextResponse.json({ link, whatsapp, codigo })
}

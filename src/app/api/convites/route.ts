import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import crypto from "crypto"
import { handleApiError } from "@/lib/api-error"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { tipo } = await request.json()
    if (!tipo || !["professor", "aluno", "amigo", "academia"].includes(tipo)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
    }

    // aluno role só pode criar convite tipo "amigo"
    if (session.user.role === "aluno" && tipo !== "amigo") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // professor ou dono pode criar convite de academia
    if (tipo === "academia" && !["professor", "dono"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const codigo = crypto.randomBytes(4).toString("hex")
    const baseUrl = process.env.NEXTAUTH_URL || "https://osstrack-app.vercel.app"
    const link = `${baseUrl}/convite/${codigo}`

    const conviteData: any = {
      codigo,
      remetenteId: session.user.id,
      academiaId: session.user.academiaId || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }

    if (tipo === "academia") {
      conviteData.tipo = "academia"
      conviteData.professorId = session.user.id
    } else {
      conviteData.tipo = tipo === "amigo" ? "aluno" : tipo
    }

    await prisma.convite.create({ data: conviteData })

    let msg: string
    if (tipo === "professor") {
      msg = `Olá! Fui convidado(a) a fazer parte da equipe no OssTrack. Acesse ${link} para se cadastrar como professor.`
    } else if (tipo === "amigo") {
      msg = `E aí! Vem treinar comigo! 🥋 Acesse ${link} e se cadastre no OssTrack para acompanharmos nossa evolução juntos.`
    } else if (tipo === "academia") {
      msg = `Olá! Sou professor e convido sua academia a se juntar ao OssTrack 🥋 Plataforma gratuita para academias e professores. Acesse ${link} e cadastre-se!`
    } else {
      msg = `Olá! Seu professor te convidou para treinar conosco. Acesse ${link} e cadastre-se no OssTrack para acompanhar sua evolução.`
    }

    const whatsapp = `https://wa.me/?text=${encodeURIComponent(msg)}`

    return NextResponse.json({ link, whatsapp, codigo })
  } catch (error) {
    return handleApiError(error)
  }
}

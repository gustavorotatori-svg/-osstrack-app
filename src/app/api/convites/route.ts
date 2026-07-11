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

    // TODO: no future, limitar tipos de convite por role se necessário

    const codigo = crypto.randomBytes(8).toString("hex")
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

    const remetenteNome = session.user.name || "Um amigo"
    let msg: string
    if (tipo === "professor") {
      msg = `${remetenteNome} te convidou para fazer parte da equipe no OssTrack 🥋 Acesse ${link} e cadastre-se como professor!`
    } else if (tipo === "amigo") {
      msg = `${remetenteNome} te convidou para treinar juntos! 🥋 Acesse ${link} e cadastre-se no OssTrack para acompanharmos nossa evolução!`
    } else if (tipo === "academia") {
      msg = `${remetenteNome} convida sua academia a se juntar ao OssTrack 🥋 Plataforma gratuita para academias e professores. Acesse ${link} e cadastre-se!`
    } else {
      msg = `${remetenteNome} te convidou para treinar no OssTrack! 🥋 Acesse ${link} e cadastre-se para acompanhar sua evolução!`
    }

    const whatsapp = `https://wa.me/?text=${encodeURIComponent(msg)}`

    return NextResponse.json({ link, whatsapp, codigo })
  } catch (error) {
    return handleApiError(error)
  }
}

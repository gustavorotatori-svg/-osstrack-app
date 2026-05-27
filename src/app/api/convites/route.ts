import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import crypto from "crypto"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !["dono", "professor"].includes(session.user.role)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { tipo, email } = await request.json() // tipo: "professor" | "aluno"
  if (!tipo) return NextResponse.json({ error: "Tipo obrigatório" }, { status: 400 })

  const codigo = crypto.randomBytes(4).toString("hex")
  const baseUrl = process.env.NEXTAUTH_URL || "https://osstrack-app.vercel.app"
  const link = `${baseUrl}/convite/${codigo}`

  await prisma.convite.create({
    data: {
      tipo,
      codigo,
      remetenteId: session.user.id,
      academiaId: session.user.academiaId || null,
      email: email || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  const msg = encodeURIComponent(
    tipo === "professor"
      ? `Olá! Fui convidado(a) a fazer parte da equipe no OssTrack. Acesse ${link} para se cadastrar como professor.`
      : `Olá! Seu professor te convidou para treinar conosco. Acesse ${link} e cadastre-se no OssTrack para acompanhar sua evolução.`
  )
  const whatsapp = `https://wa.me/?text=${msg}`

  return NextResponse.json({ link, whatsapp, codigo })
}

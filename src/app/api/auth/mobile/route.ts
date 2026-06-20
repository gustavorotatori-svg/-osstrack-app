import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { encode } from "next-auth/jwt"
import prisma from "@/lib/prisma"
import { isUserRole } from "@/lib/auth-types"

export async function POST(req: NextRequest) {
  try {
    const { email, senha } = await req.json()

    if (!email || !senha) {
      return NextResponse.json({ error: "Email e senha obrigatórios" }, { status: 400 })
    }

    const user = await prisma.usuario.findUnique({
      where: { email },
      include: { academia: { select: { nome: true } } },
    })

    if (!user) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    const valid = await bcrypt.compare(senha, user.senha)
    if (!valid) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    const role = isUserRole(user.role) ? user.role : "aluno"

    const token = await encode({
      secret: process.env.NEXTAUTH_SECRET!,
      token: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        role,
        faixa: user.faixa,
        grau: user.grau,
        academiaId: user.academiaId ?? "",
        academiaNome: user.academia?.nome || null,
      },
    })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role,
        faixa: user.faixa,
        grau: user.grau,
        academiaId: user.academiaId,
        academiaNome: user.academia?.nome || null,
        avatar: user.avatar,
      },
    })
  } catch (err) {
    console.error("Mobile auth error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { encode } from "next-auth/jwt"
import prisma from "@/lib/prisma"
import { isUserRole } from "@/lib/auth-types"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { loginSchema } from "@/lib/validation"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Email e senha obrigatórios" }, { status: 400 })
    }
    const { email, senha } = parsed.data

    // Rate limit by IP and email
    const ip = getClientIp(req)
    const ipCheck = await checkRateLimit(`mobile:ip:${ip}`, "login")
    if (!ipCheck.allowed) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente em 1 minuto." }, { status: 429 })
    }
    const emailCheck = await checkRateLimit(`mobile:email:${email}`, "login")
    if (!emailCheck.allowed) {
      return NextResponse.json({ error: "Muitas tentativas para este e-mail. Tente novamente em 1 minuto." }, { status: 429 })
    }

    const user = await prisma.usuario.findUnique({
      where: { email },
      include: { academia: { select: { nome: true } } },
    })

    if (!user) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    if (!user.senha) {
      return NextResponse.json({ error: "Conta criada com Google. Use o login com Google." }, { status: 401 })
    }

    const valid = await bcrypt.compare(senha, user.senha)
    if (!valid) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    // Server-side email verification enforcement
    if (process.env.SMTP_HOST && process.env.SMTP_USER && !user.emailVerified) {
      return NextResponse.json({ error: "E-mail não verificado. Verifique sua caixa de entrada." }, { status: 403 })
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

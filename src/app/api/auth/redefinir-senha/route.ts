import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { token, senha } = await request.json()
    if (!token || !senha) return NextResponse.json({ error: "Token e senha são obrigatórios" }, { status: 400 })
    if (senha.length < 8) return NextResponse.json({ error: "Senha deve ter no mínimo 8 caracteres" }, { status: 400 })

    const user = await prisma.usuario.findFirst({
      where: { resetToken: token, resetTokenExpires: { gt: new Date() } },
    })

    if (!user) return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })

    const senhaHash = await bcrypt.hash(senha, 10)
    await prisma.usuario.update({
      where: { id: user.id },
      data: { senha: senhaHash, resetToken: null, resetTokenExpires: null },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro ao redefinir senha" }, { status: 500 })
  }
}

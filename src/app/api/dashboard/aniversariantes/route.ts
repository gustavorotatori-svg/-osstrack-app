import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["dono", "professor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const hoje = new Date()
    const mesAtual = hoje.getMonth() + 1

    const alunos = await prisma.usuario.findMany({
      where: {
        academiaId: session.user.academiaId,
        role: "aluno",
        dataNascimento: { not: null },
      },
      select: {
        id: true,
        nome: true,
        faixa: true,
        dataNascimento: true,
        avatar: true,
      },
    })

    const aniversariantes = alunos
      .filter((a) => {
        if (!a.dataNascimento) return false
        const parts = a.dataNascimento.split("-")
        if (parts.length !== 3) return false
        const mes = parseInt(parts[1], 10)
        return !isNaN(mes) && mes === mesAtual
      })
      .map((a) => {
        const dia = parseInt(a.dataNascimento!.split("-")[2], 10)
        return {
          id: a.id,
          nome: a.nome,
          faixa: a.faixa,
          avatar: a.avatar,
          dia: isNaN(dia) ? 0 : dia,
        }
      })
      .sort((a, b) => a.dia - b.dia)

    return NextResponse.json({ aniversariantes })
  } catch (error) {
    return handleApiError(error)
  }
}

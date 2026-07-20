import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["dono", "professor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const busca = searchParams.get("busca")?.trim()

    const alunos = await prisma.usuario.findMany({
      where: {
        academiaId: session.user.academiaId,
        role: "aluno",
        ...(busca ? { nome: { contains: busca, mode: "insensitive" } } : {}),
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        faixa: true,
        grau: true,
        categoria: true,
        pontos: true,
        dataInicio: true,
        avatar: true,
        presencas: {
          orderBy: { data: "desc" },
          take: 1,
          select: { data: true },
        },
      },
      orderBy: { nome: "asc" },
    })

    return NextResponse.json({
      alunos: alunos.map((a) => ({
        id: a.id,
        nome: a.nome,
        email: a.email,
        telefone: a.telefone,
        faixa: a.faixa,
        grau: a.grau,
        categoria: a.categoria,
        pontos: a.pontos,
        dataInicio: a.dataInicio?.toISOString() || null,
        ultimaPresenca: a.presencas[0]?.data.toISOString() || null,
        avatar: a.avatar,
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

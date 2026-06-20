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

    const url = new URL(request.url)
    const dias = parseInt(url.searchParams.get("dias") || "7", 10)
    const limite = parseInt(url.searchParams.get("limite") || "20", 10)

    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - dias)

    const ultimasPresencas = await prisma.presenca.groupBy({
      by: ["alunoId"],
      where: {
        aluno: { academiaId: session.user.academiaId, role: "aluno" },
        data: { gte: dataLimite },
        status: "confirmed",
      },
      _max: { data: true },
    })

    const alunosAtivosIds = new Set(ultimasPresencas.map((p) => p.alunoId))

    const inativos = await prisma.usuario.findMany({
      where: {
        academiaId: session.user.academiaId,
        role: "aluno",
        id: { notIn: Array.from(alunosAtivosIds) },
      },
      select: {
        id: true,
        nome: true,
        faixa: true,
        grau: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: { nome: "asc" },
      take: limite,
    })

    const inativosComUltimaPresenca = await Promise.all(
      inativos.map(async (aluno) => {
        const ultima = await prisma.presenca.findFirst({
          where: { alunoId: aluno.id, status: "confirmed" },
          orderBy: { data: "desc" },
          select: { data: true },
        })
        return {
          ...aluno,
          dataCriacao: aluno.createdAt.toISOString(),
          ultimaPresenca: ultima?.data.toISOString() || null,
          diasSemTreinar: ultima
            ? Math.floor((Date.now() - ultima.data.getTime()) / (1000 * 60 * 60 * 24))
            : Math.floor((Date.now() - aluno.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        }
      })
    )

    return NextResponse.json({ inativos: inativosComUltimaPresenca, total: inativos.length })
  } catch (error) {
    return handleApiError(error)
  }
}

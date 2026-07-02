import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

const CATEGORIAS = ["adulto", "master", "infantil"]

async function getMestre(academiaId: string, mes: number, ano: number, categoria: string) {
  let mestre = await prisma.mestreDoMes.findFirst({
    where: { academiaId, mes, ano, categoria },
    include: { aluno: { select: { nome: true, faixa: true, avatar: true } } },
  })

  if (!mestre) {
    mestre = await prisma.mestreDoMes.findFirst({
      where: { academiaId, categoria },
      orderBy: [{ ano: "desc" }, { mes: "desc" }],
      include: { aluno: { select: { nome: true, faixa: true, avatar: true } } },
    })
  }

  return mestre
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.academiaId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const now = new Date()
    const mes = now.getMonth() + 1
    const ano = now.getFullYear()

    const mestres: Record<string, unknown> = {}

    for (const categoria of CATEGORIAS) {
      const mestre = await getMestre(session.user.academiaId, mes, ano, categoria)
      if (mestre) {
        mestres[categoria] = {
          nome: mestre.aluno.nome,
          faixa: mestre.aluno.faixa,
          avatar: mestre.aluno.avatar,
          totalAulas: mestre.totalAulas,
          mes: mestre.mes,
          ano: mestre.ano,
        }
      } else {
        mestres[categoria] = null
      }
    }

    return NextResponse.json({ mestres })
  } catch (error) {
    return handleApiError(error)
  }
}
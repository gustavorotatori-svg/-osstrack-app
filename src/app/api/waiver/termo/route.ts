import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.academiaId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const termo = await prisma.termoWaiver.findFirst({
      where: { academiaId: session.user.academiaId, ativo: true },
      orderBy: { updatedAt: "desc" },
    })

    const minhaAssinatura = termo
      ? await prisma.assinaturaWaiver.findUnique({
          where: { alunoId_termoId: { alunoId: session.user.id, termoId: termo.id } },
        })
      : null

    return NextResponse.json({ termo, minhaAssinatura })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "dono" || !session.user.academiaId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const conteudo = body?.conteudo?.toString().trim()
    const titulo = body?.titulo?.toString().trim() || "Termo de Responsabilidade"

    if (!conteudo || conteudo.length < 40) {
      return NextResponse.json({ error: "O termo precisa de um conteúdo com pelo menos 40 caracteres" }, { status: 400 })
    }

    const existente = await prisma.termoWaiver.findFirst({
      where: { academiaId: session.user.academiaId, ativo: true },
    })

    const termo = existente
      ? await prisma.termoWaiver.update({
          where: { id: existente.id },
          data: { titulo, conteudo, versao: existente.versao + 1, criadoPor: session.user.id },
        })
      : await prisma.termoWaiver.create({
          data: {
            academiaId: session.user.academiaId,
            titulo,
            conteudo,
            criadoPor: session.user.id,
          },
        })

    return NextResponse.json(termo)
  } catch (error) {
    return handleApiError(error)
  }
}

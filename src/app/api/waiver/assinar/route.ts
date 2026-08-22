import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { validarCpf } from "@/lib/cpf"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.academiaId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const nomeCompleto = body?.nomeCompleto?.toString().trim()
    const cpf = body?.cpf?.toString().trim()

    if (!nomeCompleto || nomeCompleto.split(" ").length < 2) {
      return NextResponse.json({ error: "Informe seu nome completo" }, { status: 400 })
    }
    if (!cpf || !validarCpf(cpf)) {
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 })
    }

    const termo = await prisma.termoWaiver.findFirst({
      where: { academiaId: session.user.academiaId, ativo: true },
      orderBy: { updatedAt: "desc" },
    })
    if (!termo) {
      return NextResponse.json({ error: "A academia ainda não publicou um termo de responsabilidade" }, { status: 404 })
    }

    const headers = req.headers
    const forwarded = headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0].trim() : headers.get("x-real-ip")
    const userAgent = headers.get("user-agent")?.slice(0, 500)

    const assinatura = await prisma.assinaturaWaiver.upsert({
      where: { alunoId_termoId: { alunoId: session.user.id, termoId: termo.id } },
      update: { nomeCompleto, cpf, ip, userAgent },
      create: {
        academiaId: session.user.academiaId,
        termoId: termo.id,
        alunoId: session.user.id,
        nomeCompleto,
        cpf,
        ip,
        userAgent,
      },
    })

    return NextResponse.json(assinatura)
  } catch (error) {
    return handleApiError(error)
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { mascararCpf } from "@/lib/cpf"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["dono", "professor"].includes(session.user.role) || !session.user.academiaId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const termo = await prisma.termoWaiver.findFirst({
      where: { academiaId: session.user.academiaId, ativo: true },
      orderBy: { updatedAt: "desc" },
    })

    const alunos = await prisma.usuario.findMany({
      where: { academiaId: session.user.academiaId, role: "aluno" },
      select: {
        id: true,
        nome: true,
        faixa: true,
        grau: true,
        createdAt: true,
        assinaturasWaiver: {
          where: { termoId: termo ? termo.id : "" },
          select: { id: true, nomeCompleto: true, cpf: true, assinadoEm: true, ip: true, userAgent: true },
        },
      },
      orderBy: { nome: "asc" },
    })

    const lista = alunos.map((a) => ({
      alunoId: a.id,
      nome: a.nome,
      faixa: a.faixa,
      grau: a.grau,
      cadastradoEm: a.createdAt,
      assinado: a.assinaturasWaiver.length > 0,
      assinatura: a.assinaturasWaiver[0]
        ? {
            nomeCompleto: a.assinaturasWaiver[0].nomeCompleto,
            cpf: mascararCpf(a.assinaturasWaiver[0].cpf),
            assinadoEm: a.assinaturasWaiver[0].assinadoEm,
            ip: a.assinaturasWaiver[0].ip,
            userAgent: a.assinaturasWaiver[0].userAgent,
          }
        : null,
    }))

    return NextResponse.json({
      termo: termo ? { id: termo.id, titulo: termo.titulo, versao: termo.versao, updatedAt: termo.updatedAt } : null,
      totalAlunos: lista.length,
      assinaram: lista.filter((a) => a.assinado).length,
      alunos: lista,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

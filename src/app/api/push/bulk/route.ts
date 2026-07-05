import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { notificarUsuario } from "@/lib/notificar"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["dono", "professor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const { alunoIds, titulo, descricao } = await req.json()
    if (!alunoIds?.length || !titulo) {
      return NextResponse.json({ error: "alunoIds e titulo sao obrigatorios" }, { status: 400 })
    }

    const alunos = await prisma.usuario.findMany({
      where: {
        id: { in: alunoIds },
        academiaId: session.user.academiaId,
        role: "aluno",
      },
      select: { id: true },
    })

    let sent = 0
    for (const a of alunos) {
      await notificarUsuario({
        usuarioId: a.id,
        tipo: "comunicado",
        titulo,
        descricao: descricao || "",
        link: "/dashboard/aluno",
      }).catch(() => {})
      sent++
    }

    return NextResponse.json({ ok: true, sent, total: alunos.length })
  } catch (error) {
    return handleApiError(error)
  }
}

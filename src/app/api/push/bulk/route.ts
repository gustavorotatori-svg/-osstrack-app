import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"
import { notificarUsuario } from "@/lib/notificar"
import { pushBulkSchema } from "@/lib/validation"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["dono", "professor"].includes(session.user.role)) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const parsed = pushBulkSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "alunoIds e titulo são obrigatórios" }, { status: 400 })
    }
    const { alunoIds, titulo, descricao } = parsed.data

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

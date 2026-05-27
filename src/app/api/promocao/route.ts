import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !["professor", "dono"].includes(session.user.role)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { alunoId, novaFaixa, novoGrau } = await request.json()

  const aluno = await prisma.usuario.findFirst({
    where: { id: alunoId, professorId: session.user.id },
  })

  if (!aluno) return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
  if (!aluno.academiaId) return NextResponse.json({ error: "Aluno sem academia vinculada" }, { status: 400 })

  const updated = await prisma.usuario.update({
    where: { id: alunoId },
    data: {
      faixa: novaFaixa || aluno.faixa,
      grau: novoGrau !== undefined ? novoGrau : aluno.grau,
    },
  })

  await prisma.notificacao.create({
    data: {
      usuarioId: alunoId,
      tipo: "promocao",
      titulo: "Parabéns pela promoção!",
      descricao: `Você foi promovido para ${novaFaixa || aluno.faixa} ${novoGrau !== undefined ? `${novoGrau + 1}º Grau` : ""} pelo professor ${session.user.name}`,
      link: "/dashboard/aluno/evolucao",
    },
  })

  await prisma.postagemMural.create({
    data: {
      academiaId: aluno.academiaId,
      alunoId: alunoId,
      tipo: "promocao",
      conteudo: `${aluno.nome} foi promovido(a) para ${novaFaixa || aluno.faixa} ${novoGrau !== undefined ? `${novoGrau + 1}º Grau` : ""}! 🥋`,
    },
  })

  return NextResponse.json({ success: true, aluno: { nome: updated.nome, faixa: updated.faixa, grau: updated.grau } })
}

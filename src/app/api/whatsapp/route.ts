import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

function limparTelefone(tel: string) {
  return tel.replace(/\D/g, "")
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { acao, alunoId, linkPersonalizado } = await req.json()

  if (!alunoId) return NextResponse.json({ error: "alunoId obrigatório" }, { status: 400 })

  const aluno = await prisma.usuario.findUnique({ where: { id: alunoId } })
  if (!aluno) return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })

  const academia = await prisma.academia.findUnique({ where: { id: session.user.academiaId } })
  const telefone = aluno.telefone ? limparTelefone(aluno.telefone) : null
  if (!telefone) return NextResponse.json({ error: "Aluno não tem telefone cadastrado" }, { status: 400 })

  let mensagem = ""

  switch (acao) {
    case "checkin":
      mensagem = `*${academia?.nome || "Academia"}* 🥋\n\n🎯 *Check-in confirmado!*\n\n${aluno.nome}, sua presença foi registrada com sucesso.\nContinue assim! 🔥\n\nOss! 🥋`
      break
    case "lembrete":
      mensagem = `*${academia?.nome || "Academia"}* 🥋\n\n⏰ *Lembrete de Treino!*\n\n${aluno.nome}, não esqueça do treino hoje! Sua presença faz a diferença. 💪\n\nOss! 🥋`
      break
    case "promocao":
      mensagem = `*${academia?.nome || "Academia"}* 🥋\n\n🎉 *Parabéns pela promoção!*\n\n${aluno.nome}, você foi promovido(a)! Sua dedicação é inspiradora. 🙌\n\nOss! 🥋`
      break
    default:
      mensagem = linkPersonalizado || `Olá *${aluno.nome}*! Mensagem de *${academia?.nome || "Academia"}*. Oss! 🥋`
  }

  const link = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`

  return NextResponse.json({ link, mensagem, telefone })
}

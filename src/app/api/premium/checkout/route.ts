import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "aluno") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const usuario = await prisma.usuario.findUnique({ where: { id: session.user.id } })
  if (!usuario) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

  if (usuario.plano === "premium") {
    return NextResponse.json({ error: "Já é premium" }, { status: 400 })
  }

  const agora = new Date()
  const expiracao = new Date(agora)
  expiracao.setDate(expiracao.getDate() + 30)

  await prisma.usuario.update({
    where: { id: session.user.id },
    data: {
      plano: "premium",
      planoInicio: agora,
      planoExpiracao: expiracao,
    },
  })

  const mes = agora.getMonth() + 1
  const ano = agora.getFullYear()

  await prisma.pagamento.create({
    data: {
      usuarioId: session.user.id,
      valor: 490,
      status: "confirmed",
      metodo: "cartao",
      mesReferencia: mes,
      anoReferencia: ano,
    },
  })

  await prisma.notificacao.create({
    data: {
      usuarioId: session.user.id,
      tipo: "sistema",
      titulo: "Bem-vindo ao Premium!",
      descricao: "Você agora tem acesso a todas as funcionalidades. Aproveite! 🥋",
      link: "/dashboard/aluno/premium",
    },
  })

  return NextResponse.json({ success: true, plano: "premium", expiracao })
}

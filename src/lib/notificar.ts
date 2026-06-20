import prisma from "@/lib/prisma"
import { sendPushToUser } from "@/lib/webpush"

export async function notificarUsuario(params: {
  usuarioId: string
  tipo: string
  titulo: string
  descricao: string
  link?: string
}) {
  const { usuarioId, tipo, titulo, descricao, link } = params

  const notificacao = await prisma.notificacao.create({
    data: { usuarioId, tipo, titulo, descricao, link: link || null },
  })

  const pushResult = await sendPushToUser(usuarioId, {
    title: titulo.replace(/[^\w\sÀ-ÿ!?,.]+/g, "").trim(),
    body: descricao.replace(/[^\w\sÀ-ÿ!?,.]+/g, "").trim(),
    url: link || undefined,
  })

  return { notificacao, push: pushResult }
}

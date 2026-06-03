"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function enviarContato(formData: FormData) {
  const nome = formData.get("nome")?.toString().trim()
  const email = formData.get("email")?.toString().trim()
  const mensagem = formData.get("mensagem")?.toString().trim()

  if (!nome || !email || !mensagem) return

  try {
    await prisma.contato.create({
      data: { nome, email, mensagem },
    })
  } catch {
    // silently ignore
  }

  revalidatePath("/ajuda")
}

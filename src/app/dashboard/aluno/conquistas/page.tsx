import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { AchievementsClient } from "./client"

export default async function ConquistasPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "aluno") redirect("/login")

  const todas = await prisma.conquista.findMany()
  const desbloqueadas = await prisma.alunoConquista.findMany({
    where: { alunoId: session.user.id },
  })

  return (
    <AchievementsClient
      conquistas={todas.map((c) => ({
        ...c, desbloqueada: desbloqueadas.some((ac) => ac.conquistaId === c.id),
      }))}
    />
  )
}

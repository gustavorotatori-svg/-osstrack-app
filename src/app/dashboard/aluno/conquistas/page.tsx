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
  const desbloqueadasMap = new Map(desbloqueadas.map((ac) => [ac.conquistaId, ac]))

  return (
    <AchievementsClient
      conquistas={todas.map((c) => {
        const ac = desbloqueadasMap.get(c.id)
        return {
          ...c,
          desbloqueada: !!ac,
          progresso: ac?.progresso || 0,
        }
      })}
    />
  )
}

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { EvolutionClient } from "./client"

export default async function EvolucaoPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "aluno") redirect("/login")

  const aluno = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    include: { academia: true },
  })

  if (!aluno || !aluno.academiaId) redirect("/login")

  const totalAulas = await prisma.presenca.count({
    where: { alunoId: aluno.id, status: "confirmed" },
  })

  const graduacoes = await prisma.graduacao.findMany({
    where: { academiaId: aluno.academiaId, categoria: aluno.categoria },
    orderBy: { aulasProxFx: "asc" },
  })

  return (
    <EvolutionClient
      aluno={{ nome: aluno.nome, faixa: aluno.faixa, grau: aluno.grau, totalAulas }}
      graduacoes={graduacoes.map((g) => ({
        faixa: g.faixa, graus: g.graus, aulasPorGrau: g.aulasPorGrau, aulasProxFx: g.aulasProxFx,
      }))}
    />
  )
}

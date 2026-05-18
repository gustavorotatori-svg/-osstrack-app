import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { RankingClient } from "./client"

export default async function RankingPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "aluno") redirect("/login")

  const alunos = await prisma.usuario.findMany({
    where: { academiaId: session.user.academiaId, role: "aluno" },
    orderBy: { nome: "asc" },
  })

  const presencasCount = await prisma.presenca.groupBy({
    by: ["alunoId"],
    where: { status: "confirmed" },
    _count: true,
  })

  const ranking = alunos
    .map((a) => ({
      id: a.id,
      nome: a.nome,
      faixa: a.faixa,
      grau: a.grau,
      totalAulas: presencasCount.find((p) => p.alunoId === a.id)?._count || 0,
    }))
    .sort((a, b) => b.totalAulas - a.totalAulas)

  return <RankingClient ranking={ranking} alunoId={session.user.id} />
}

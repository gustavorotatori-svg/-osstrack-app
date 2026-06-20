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

  if (!aluno) redirect("/dashboard/aluno")

  const totalAulas = await prisma.presenca.count({
    where: { alunoId: aluno.id, status: "confirmed" },
  })

  const graduacoes = aluno.academiaId
    ? await prisma.graduacao.findMany({
        where: { academiaId: aluno.academiaId, categoria: aluno.categoria },
        orderBy: { aulasProxFx: "asc" },
      })
    : []

  // Aulas por mês (últimos 6 meses)
  const seisMesesAtras = new Date()
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6)
  const presencas = await prisma.presenca.findMany({
    where: { alunoId: aluno.id, status: "confirmed", data: { gte: seisMesesAtras } },
    orderBy: { data: "asc" },
    select: { data: true },
  })

  const aulasPorMes = new Map<string, number>()
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
  presencas.forEach((p) => {
    const key = `${p.data.getFullYear()}-${String(p.data.getMonth() + 1).padStart(2, "0")}`
    aulasPorMes.set(key, (aulasPorMes.get(key) || 0) + 1)
  })

  const presencasMensais = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    return {
      mes: meses[d.getMonth()],
      total: aulasPorMes.get(key) || 0,
    }
  })

  return (
    <EvolutionClient
      aluno={{ nome: aluno.nome, faixa: aluno.faixa, grau: aluno.grau, totalAulas, dataInicio: aluno.dataInicio?.toISOString() || "" }}
      graduacoes={graduacoes.map((g) => ({
        faixa: g.faixa, graus: g.graus, aulasPorGrau: g.aulasPorGrau, aulasProxFx: g.aulasProxFx,
      }))}
      presencasMensais={presencasMensais}
    />
  )
}

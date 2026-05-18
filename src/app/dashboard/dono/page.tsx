import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { OwnerDashboardClient } from "./client"

export default async function DonoDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono") redirect("/login")

  const academia = await prisma.academia.findUnique({
    where: { id: session.user.academiaId },
  })

  if (!academia) redirect("/login")

  const totalAlunos = await prisma.usuario.count({
    where: { academiaId: academia.id, role: "aluno" },
  })

  const totalProfessores = await prisma.usuario.count({
    where: { academiaId: academia.id, role: "professor" },
  })

  const totalPresencas = await prisma.presenca.count({
    where: { aluno: { academiaId: academia.id }, status: "confirmed" },
  })

  const alunos = await prisma.usuario.findMany({
    where: { academiaId: academia.id, role: "aluno" },
    orderBy: { nome: "asc" },
  })

  const presencas = await prisma.presenca.findMany({
    where: { aluno: { academiaId: academia.id } },
    include: { aluno: true },
    orderBy: { data: "desc" },
    take: 20,
  })

  const graduacoes = await prisma.graduacao.findMany({
    where: { academiaId: academia.id, categoria: "adulto" },
    orderBy: { aulasProxFx: "asc" },
  })

  return (
    <OwnerDashboardClient
      academia={{ nome: academia.nome, responsavel: academia.responsavel }}
      stats={{ totalAlunos, totalProfessores, totalPresencas }}
      alunos={alunos.map((a) => ({ id: a.id, nome: a.nome, faixa: a.faixa, grau: a.grau }))}
      presencas={presencas.map((p) => ({
        id: p.id,
        aluno: p.aluno.nome,
        data: p.data.toISOString(),
        horario: p.horario,
        status: p.status,
      }))}
      graduacoes={graduacoes.map((g) => ({
        faixa: g.faixa,
        graus: g.graus,
        aulasPorGrau: g.aulasPorGrau,
        aulasProxFx: g.aulasProxFx,
      }))}
    />
  )
}

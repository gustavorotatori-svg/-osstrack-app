import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { OwnerDashboardClient } from "../client"

export default async function DonoAlunosPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono") redirect("/login")

  const academia = await prisma.academia.findUnique({ where: { id: session.user.academiaId } })
  if (!academia) redirect("/login")

  const alunos = await prisma.usuario.findMany({ where: { academiaId: academia.id, role: "aluno" } })
  const professores = await prisma.usuario.count({ where: { academiaId: academia.id, role: "professor" } })
  const presencas = await prisma.presenca.count({ where: { aluno: { academiaId: academia.id }, status: "confirmed" } })
  const graduacoes = await prisma.graduacao.findMany({ where: { academiaId: academia.id } })

  return (
    <OwnerDashboardClient
      role="dono"
      academia={{ nome: academia.nome, responsavel: academia.responsavel, rankingVisivel: academia.rankingVisivel }}
      stats={{
        totalAlunos: alunos.length,
        totalProfessores: professores,
        totalPresencas: presencas,
      }}
      presencasMensais={[]}
      alunosPorCategoria={[]}
      alunos={alunos.map((a) => ({ id: a.id, nome: a.nome, faixa: a.faixa, grau: a.grau, categoria: a.categoria }))}
      presencas={[]}
      graduacoes={graduacoes.map((g) => ({ faixa: g.faixa, graus: g.graus, aulasPorGrau: g.aulasPorGrau, aulasProxFx: g.aulasProxFx }))}
    />
  )
}

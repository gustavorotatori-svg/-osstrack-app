import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { OwnerDashboardClient } from "@/components/dashboard/owner-dashboard"
import { ProfessorSemAcademia } from "./sem-academia"

export default async function ProfessorDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "professor") redirect("/login")

  const professor = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    include: { academia: true },
  })

  if (!professor) redirect("/login")

  if (!professor.academia) {
    return <ProfessorSemAcademia nome={professor.nome} faixa={professor.faixa} />
  }

  const academia = professor.academia

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

  const seisMesesAtras = new Date()
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6)
  const presencasPorMes = await prisma.presenca.groupBy({
    by: ["data"],
    where: { aluno: { academiaId: academia.id }, status: "confirmed", data: { gte: seisMesesAtras } },
    _count: true,
  })

  const presencasMesMap = new Map<string, number>()
  presencasPorMes.forEach((p) => {
    const key = `${p.data.getFullYear()}-${String(p.data.getMonth() + 1).padStart(2, "0")}`
    presencasMesMap.set(key, (presencasMesMap.get(key) || 0) + p._count)
  })

  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
  const presencasMensais = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    return {
      mes: `${meses[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
      total: presencasMesMap.get(key) || 0,
    }
  })

  const alunosPorCategoria = await prisma.usuario.groupBy({
    by: ["categoria"],
    where: { academiaId: academia.id, role: "aluno" },
    _count: true,
  })

  return (
    <OwnerDashboardClient
      role="professor"
      academia={{
        nome: academia.nome,
        responsavel: `${professor.nome} · ${professor.faixa}`,
        rankingVisivel: academia.rankingVisivel,
      }}
      stats={{
        totalAlunos,
        totalProfessores,
        totalPresencas,
      }}
      presencasMensais={presencasMensais}
      alunosPorCategoria={alunosPorCategoria.map((a) => ({ categoria: a.categoria, total: a._count }))}
      alunos={alunos.map((a) => ({ id: a.id, nome: a.nome, faixa: a.faixa, grau: a.grau, categoria: a.categoria }))}
      presencas={presencas.map((p) => ({
        id: p.id,
        aluno: p.aluno.nome,
        data: p.data.toISOString(),
        horario: p.horario,
        status: p.status || "pending",
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

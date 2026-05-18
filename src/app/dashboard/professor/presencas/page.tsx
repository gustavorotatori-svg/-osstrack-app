import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { ProfessorDashboardClient } from "../client"

export default async function PresencasPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "professor") redirect("/login")

  const professor = await prisma.usuario.findUnique({ where: { id: session.user.id } })
  if (!professor) redirect("/login")

  const alunos = await prisma.usuario.findMany({
    where: { professorId: professor.id, role: "aluno" },
  })

  const turmas = await prisma.turma.findMany({
    where: { professorId: professor.id },
    include: { alunos: true },
  })

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)

  const presencasHoje = await prisma.presenca.findMany({
    where: { data: { gte: hoje, lt: amanha }, aluno: { professorId: professor.id } },
    include: { aluno: true },
    orderBy: { horario: "asc" },
  })

  return (
    <ProfessorDashboardClient
      professor={{ nome: professor.nome, faixa: professor.faixa, grau: professor.grau }}
      alunos={alunos.map((a) => ({ id: a.id, nome: a.nome, faixa: a.faixa, grau: a.grau }))}
      turmas={turmas.map((t) => ({ id: t.id, nome: t.nome, horario: t.horario, dias: t.dias, maxAlunos: t.maxAlunos, totalAlunos: t.alunos.length }))}
      presencasHoje={presencasHoje.map((p) => ({
        id: p.id,
        aluno: { id: p.aluno.id, nome: p.aluno.nome, faixa: p.aluno.faixa },
        data: p.data.toISOString(),
        horario: p.horario,
        status: p.status,
        turma: p.turma || "",
      }))}
    />
  )
}

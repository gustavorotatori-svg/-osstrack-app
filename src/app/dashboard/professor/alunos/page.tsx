import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { ProfessorDashboardClient } from "../client"

export default async function ProfessorAlunosPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "professor") redirect("/login")

  const professor = await prisma.usuario.findUnique({ where: { id: session.user.id } })
  if (!professor) redirect("/login")

  const alunos = await prisma.usuario.findMany({ where: { professorId: professor.id, role: "aluno" } })
  const turmas = await prisma.turma.findMany({ where: { professorId: professor.id }, include: { alunos: true } })

  return (
    <ProfessorDashboardClient
      professor={{ nome: professor.nome, faixa: professor.faixa, grau: professor.grau }}
      alunos={alunos.map((a) => ({ id: a.id, nome: a.nome, faixa: a.faixa, grau: a.grau }))}
      turmas={turmas.map((t) => ({ id: t.id, nome: t.nome, horario: t.horario, dias: t.dias, maxAlunos: t.maxAlunos, totalAlunos: t.alunos.length }))}
      presencasHoje={[]}
    />
  )
}

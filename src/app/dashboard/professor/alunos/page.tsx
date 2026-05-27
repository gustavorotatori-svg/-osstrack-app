import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { AlunosClient } from "./client"

export default async function ProfessorAlunosPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "professor") redirect("/login")

  const professor = await prisma.usuario.findUnique({ where: { id: session.user.id } })
  if (!professor) redirect("/login")

  const alunos = await prisma.usuario.findMany({
    where: { professorId: professor.id, role: "aluno" },
    orderBy: { nome: "asc" },
  })

  return (
    <AlunosClient
      alunos={alunos.map((a) => ({ id: a.id, nome: a.nome, faixa: a.faixa, grau: a.grau }))}
    />
  )
}

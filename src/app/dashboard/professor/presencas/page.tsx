import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { PresencasClient } from "./client"

export default async function PresencasPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "professor") redirect("/login")

  const professor = await prisma.usuario.findUnique({ where: { id: session.user.id } })
  if (!professor) redirect("/login")

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
    <PresencasClient
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

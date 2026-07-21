import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { PresencasClient } from "../../professor/presencas/client"
import { BackButton } from "@/components/ui/back-button"

export default async function DonoPresencasPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono") redirect("/login")

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)

  const presencasHoje = await prisma.presenca.findMany({
    where: { data: { gte: hoje, lt: amanha }, aluno: { academiaId: session.user.academiaId } },
    include: { aluno: true },
    orderBy: { horario: "asc" },
  })

  const alunos = await prisma.usuario.findMany({
    where: { academiaId: session.user.academiaId, role: "aluno" },
    select: { id: true, nome: true, faixa: true },
    orderBy: { nome: "asc" },
  })

  return (
    <>
      <BackButton href="/dashboard/dono" />
      <PresencasClient
        role="dono"
        presencasHoje={presencasHoje.map((p) => ({
          id: p.id,
          aluno: { id: p.aluno.id, nome: p.aluno.nome, faixa: p.aluno.faixa },
          data: p.data.toISOString(),
          horario: p.horario,
          status: p.status,
          turma: p.turma || "",
        }))}
        todosAlunos={alunos}
      />
    </>
  )
}

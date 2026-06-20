import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { StudentDashboardClient } from "./client"

export default async function AlunoDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "aluno") redirect("/login")

  const aluno = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    include: {
      presencas: { orderBy: { data: "desc" }, take: 30 },
      academia: true,
    },
  })

  if (!aluno) redirect("/login")

  const totalAulas = await prisma.presenca.count({
    where: { alunoId: aluno.id, status: "confirmed" },
  })

  const ultimasPresencas = await prisma.presenca.findMany({
    where: { alunoId: aluno.id },
    orderBy: { data: "desc" },
    take: 10,
  })

  const conquistas = await prisma.alunoConquista.findMany({
    where: { alunoId: aluno.id },
    include: { conquista: true },
  })

  const todasConquistas = await prisma.conquista.findMany()

  const graduacao = aluno.academiaId
    ? await prisma.graduacao.findFirst({
        where: { academiaId: aluno.academiaId, categoria: aluno.categoria, faixa: aluno.faixa },
      })
    : null

  const streakData = await prisma.streak.findUnique({
    where: { usuarioId: aluno.id },
  })

  return (
    <StudentDashboardClient
      aluno={{
        id: aluno.id,
        nome: aluno.nome,
        faixa: aluno.faixa,
        grau: aluno.grau,
        totalAulas,
        pontos: aluno.pontos,
        dataInicio: aluno.dataInicio?.toISOString() || "",
        academia: aluno.academia?.nome || "",
      }}
      graduacao={graduacao ? {
        aulasPorGrau: graduacao.aulasPorGrau,
        aulasProxFx: graduacao.aulasProxFx,
        graus: graduacao.graus,
      } : null}
      ultimasPresencas={ultimasPresencas.map((p) => ({
        id: p.id,
        data: p.data.toISOString(),
        horario: p.horario,
        status: p.status,
        turma: p.turma || "",
      }))}
      conquistas={todasConquistas.map((c) => ({
        ...c,
        desbloqueada: conquistas.some((ac) => ac.conquistaId === c.id),
      }))}
      streak={streakData?.currentStreak || 0}
      nivelDisciplina={aluno.nivelDisciplina}
    />
  )
}

import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { AlunoDetalheClient } from "@/components/dashboard/aluno-detalhe"
import { BackButton } from "@/components/ui/back-button"

export default async function DonoAlunoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "dono") redirect("/login")

  const { id } = await params

  const aluno = await prisma.usuario.findUnique({
    where: { id },
    include: {
      academia: { select: { nome: true } },
      streak: true,
      familiaMembros: {
        include: {
          familia: {
            include: {
              membros: {
                include: {
                  aluno: { select: { id: true, nome: true, faixa: true } },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!aluno || aluno.academiaId !== session.user.academiaId || aluno.role !== "aluno") {
    notFound()
  }

  const totalAulas = await prisma.presenca.count({
    where: { alunoId: aluno.id, status: "confirmed" },
  })

  const totalPresencas = await prisma.presenca.count({
    where: { alunoId: aluno.id },
  })

  const thisMonth = await prisma.presenca.count({
    where: {
      alunoId: aluno.id,
      status: "confirmed",
      data: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    },
  })

  const ultimosCheckins = await prisma.presenca.findMany({
    where: { alunoId: aluno.id },
    orderBy: { data: "desc" },
    take: 5,
    select: { data: true, horario: true, status: true },
  })

  const familiaInfo = aluno.familiaMembros[0]
    ? {
        id: aluno.familiaMembros[0].familia.id,
        nome: aluno.familiaMembros[0].familia.nome,
        desconto: aluno.familiaMembros[0].familia.desconto,
        membros: aluno.familiaMembros[0].familia.membros.map((m) => ({
          id: m.aluno.id,
          nome: m.aluno.nome,
          faixa: m.aluno.faixa,
        })),
      }
    : null

  return (
    <>
      <BackButton href="/dashboard/dono/alunos" />
      <AlunoDetalheClient
        role="dono"
        aluno={{
          id: aluno.id,
          nome: aluno.nome,
          email: aluno.email,
          telefone: aluno.telefone,
          avatar: aluno.avatar,
          faixa: aluno.faixa,
          grau: aluno.grau,
          categoria: aluno.categoria,
          dataInicio: aluno.dataInicio?.toISOString() || null,
          academia: aluno.academia?.nome || "",
          totalAulas,
          totalPresencas,
          thisMonth,
          currentStreak: aluno.streak?.currentStreak || 0,
          bestStreak: aluno.streak?.bestStreak || 0,
          familia: familiaInfo,
          ultimosCheckins: ultimosCheckins.map((c) => ({
            data: c.data.toISOString(),
            horario: c.horario,
            status: c.status,
          })),
        }}
      />
    </>
  )
}

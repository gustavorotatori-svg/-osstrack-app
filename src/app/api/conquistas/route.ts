import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "aluno") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const totalAulas = await prisma.presenca.count({
    where: { alunoId: session.user.id, status: "confirmed" },
  })

  const streak = await prisma.streak.findUnique({
    where: { usuarioId: session.user.id },
  })

  const conquistas = await prisma.conquista.findMany()
  const desbloqueadas = await prisma.alunoConquista.findMany({
    where: { alunoId: session.user.id },
  })
  const desbloqueadasIds = new Set(desbloqueadas.map((d) => d.conquistaId))

  const novas: string[] = []

  for (const c of conquistas) {
    if (desbloqueadasIds.has(c.id)) continue

    let atingiu = false
    if (c.tipo === "aulas") {
      atingiu = totalAulas >= c.condicao
    } else if (c.tipo === "streak") {
      atingiu = (streak?.currentStreak || 0) >= c.condicao
    } else if (c.tipo === "presencas_mes") {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const presencasMes = await prisma.presenca.count({
        where: { alunoId: session.user.id, status: "confirmed", data: { gte: startOfMonth, lte: endOfMonth } },
      })
      atingiu = presencasMes >= c.condicao
    }

    if (atingiu) {
      await prisma.alunoConquista.create({
        data: { alunoId: session.user.id, conquistaId: c.id },
      })
      await prisma.notificacao.create({
        data: {
          usuarioId: session.user.id,
          tipo: "conquista",
          titulo: "Nova Conquista!",
          descricao: `Você desbloqueou "${c.nome}"`,
          link: "/dashboard/aluno/conquistas",
        },
      })
      novas.push(c.nome)
    }
  }

  return NextResponse.json({ novas, total: totalAulas, streak: streak?.currentStreak || 0 })
}

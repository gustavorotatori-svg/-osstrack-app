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

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const presencasMes = await prisma.presenca.count({
    where: { alunoId: session.user.id, status: "confirmed", data: { gte: startOfMonth, lte: endOfMonth } },
  })

  const presencasManha = await prisma.presenca.count({
    where: { alunoId: session.user.id, status: "confirmed", horario: { lt: "08:00" } },
  })

  const convitesFeitos = await prisma.convite.count({
    where: { remetenteId: session.user.id },
  })

  const mestreDoMes = await prisma.mestreDoMes.count({
    where: { alunoId: session.user.id },
  })

  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const presencasSemana = await prisma.presenca.count({
    where: { alunoId: session.user.id, status: "confirmed", data: { gte: startOfWeek } },
  })

  const aluno = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    select: { faixa: true },
  })

  const conquistas = await prisma.conquista.findMany()
  const desbloqueadas = await prisma.alunoConquista.findMany({
    where: { alunoId: session.user.id },
  })
  const desbloqueadasMap = new Map(desbloqueadas.map((d) => [d.conquistaId, d]))

  const novas: string[] = []

  for (const c of conquistas) {
    const jaTem = desbloqueadasMap.has(c.id)
    let progresso = 0
    let atingiu = false

    if (c.tipo === "aulas") {
      progresso = Math.min(totalAulas, c.condicao)
      atingiu = totalAulas >= c.condicao
    } else if (c.tipo === "streak") {
      progresso = Math.min(streak?.currentStreak || 0, c.condicao)
      atingiu = (streak?.currentStreak || 0) >= c.condicao
    } else if (c.tipo === "presencas_mes") {
      progresso = Math.min(presencasMes, c.condicao)
      atingiu = presencasMes >= c.condicao
    } else if (c.tipo === "madrugador") {
      progresso = Math.min(presencasManha, c.condicao)
      atingiu = presencasManha >= c.condicao
    } else if (c.tipo === "convites") {
      progresso = Math.min(convitesFeitos, c.condicao)
      atingiu = convitesFeitos >= c.condicao
    } else if (c.tipo === "mestre_mes") {
      progresso = Math.min(mestreDoMes, c.condicao)
      atingiu = mestreDoMes >= c.condicao
    } else if (c.tipo === "semana_completa") {
      // Number of weeks with 5+ presencas
      const semanasCompletas = await prisma.presenca.groupBy({
        by: ["data"],
        where: { alunoId: session.user.id, status: "confirmed" },
        _count: true,
      })
      // Simplified: count distinct weeks with 5+ presencas
      const weekMap = new Map<string, number>()
      for (const p of await prisma.presenca.findMany({ where: { alunoId: session.user.id, status: "confirmed" }, select: { data: true } })) {
        const d = new Date(p.data)
        const wk = `${d.getFullYear()}-${d.getMonth()}-${Math.floor(d.getDate() / 7)}`
        weekMap.set(wk, (weekMap.get(wk) || 0) + 1)
      }
      const semanasCheias = Array.from(weekMap.values()).filter((count) => count >= 5).length
      progresso = Math.min(semanasCheias, c.condicao)
      atingiu = semanasCheias >= c.condicao
    } else if (c.tipo === "feriado") {
      // Simplified: weekend/holiday presencas
      const feriados = (await prisma.presenca.findMany({
        where: { alunoId: session.user.id, status: "confirmed" },
        select: { data: true },
      })).filter((p) => {
        const d = new Date(p.data)
        return d.getDay() === 0 || d.getDay() === 6
      }).length
      progresso = Math.min(feriados, c.condicao)
      atingiu = feriados >= c.condicao
    } else if (c.tipo.startsWith("faixa_")) {
      const faixaAlvo = c.tipo.replace("faixa_", "")
      const faixaMap: Record<string, number> = { branca: 0, azul: 1, roxa: 2, marrom: 3, preta: 4 }
      const faixaAtual = faixaMap[aluno?.faixa?.toLowerCase() || "branca"] || 0
      const faixaNeeded = faixaMap[faixaAlvo] || 0
      progresso = faixaAtual >= faixaNeeded ? 1 : 0
      atingiu = faixaAtual >= faixaNeeded
    }

    if (!jaTem && atingiu) {
      await prisma.alunoConquista.create({
        data: { alunoId: session.user.id, conquistaId: c.id, progresso: c.condicao },
      })
      await prisma.notificacao.create({
        data: {
          usuarioId: session.user.id,
          tipo: "conquista",
          titulo: `🏅 Nova Conquista: ${c.nome}`,
          descricao: c.descricao,
          link: "/dashboard/aluno/conquistas",
        },
      })
      novas.push(c.nome)
    } else if (jaTem && progresso > (desbloqueadasMap.get(c.id)?.progresso || 0)) {
      await prisma.alunoConquista.update({
        where: { alunoId_conquistaId: { alunoId: session.user.id, conquistaId: c.id } },
        data: { progresso },
      })
    }
  }

  // Fetch updated state
  const updatedDesbloqueadas = await prisma.alunoConquista.findMany({
    where: { alunoId: session.user.id },
  })
  const updatedMap = new Map(updatedDesbloqueadas.map((d) => [d.conquistaId, d]))

  const conquistasComProgresso = conquistas.map((c) => {
    const ac = updatedMap.get(c.id)
    let progressoAtual = 0
    if (c.tipo === "aulas") progressoAtual = totalAulas
    else if (c.tipo === "streak") progressoAtual = streak?.currentStreak || 0
    else if (c.tipo === "presencas_mes") progressoAtual = presencasMes
    return {
      ...c,
      desbloqueada: !!ac,
      progresso: ac?.progresso || 0,
      progressoAtual,
    }
  })

  return NextResponse.json({ novas, conquistas: conquistasComProgresso })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "aluno") return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const conquistas = await prisma.conquista.findMany()
  const desbloqueadas = await prisma.alunoConquista.findMany({
    where: { alunoId: session.user.id },
  })
  const desbloqueadasMap = new Map(desbloqueadas.map((d) => [d.conquistaId, d]))

  return NextResponse.json(
    conquistas.map((c) => {
      const ac = desbloqueadasMap.get(c.id)
      return {
        ...c,
        desbloqueada: !!ac,
        progresso: ac?.progresso || 0,
      }
    })
  )
}

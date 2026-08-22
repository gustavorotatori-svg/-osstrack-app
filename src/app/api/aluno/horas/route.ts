import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { handleApiError } from "@/lib/api-error"

const MINUTOS_PADRAO = 60

function parseHorario(h: string): number | null {
  const [hStr, mStr] = h.split(":")
  const horas = parseInt(hStr, 10)
  const minutos = parseInt(mStr, 10)
  if (isNaN(horas) || isNaN(minutos)) return null
  return horas * 60 + minutos
}

async function calcularDuracaoMinutos(
  presenca: { data: Date; horario: string; turma: string | null; duracaoMinutos: number | null },
  academiaId: string,
): Promise<number> {
  if (presenca.duracaoMinutos && presenca.duracaoMinutos > 0) return presenca.duracaoMinutos

  const diaSemana = presenca.data.getDay()

  if (presenca.turma) {
    const horario = await prisma.horarioAula.findFirst({
      where: {
        academiaId,
        turma: { nome: presenca.turma },
        diaSemana,
      },
    })
    if (horario) {
      const inicio = parseHorario(horario.horaInicio)
      const fim = parseHorario(horario.horaFim)
      if (inicio !== null && fim !== null && fim > inicio) return fim - inicio
    }
  }

  const checkinMinutos = parseHorario(presenca.horario)
  if (checkinMinutos !== null) {
    const horarios = await prisma.horarioAula.findMany({
      where: { academiaId, diaSemana },
    })
    for (const h of horarios) {
      const inicio = parseHorario(h.horaInicio)
      const fim = parseHorario(h.horaFim)
      if (inicio !== null && fim !== null && checkinMinutos >= inicio - 15 && checkinMinutos <= inicio + 15) {
        return fim - inicio
      }
    }
  }

  return MINUTOS_PADRAO
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const user = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: { academiaId: true },
    })
    if (!user?.academiaId) {
      return NextResponse.json({ error: "Academia não encontrada" }, { status: 404 })
    }
    const academiaId = user.academiaId

    const { searchParams } = new URL(req.url)
    const periodo = searchParams.get("periodo") || "ytd"
    const de = searchParams.get("de")
    const ate = searchParams.get("ate")

    const agora = new Date()
    let dataInicio: Date

    switch (periodo) {
      case "semana": {
        const dia = agora.getDay()
        const diff = dia === 0 ? 6 : dia - 1
        dataInicio = new Date(agora)
        dataInicio.setDate(agora.getDate() - diff)
        dataInicio.setHours(0, 0, 0, 0)
        break
      }
      case "mes": {
        dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1)
        break
      }
      case "trimestre": {
        dataInicio = new Date(agora)
        dataInicio.setMonth(agora.getMonth() - 3)
        break
      }
      case "ano":
      case "ytd": {
        dataInicio = new Date(agora.getFullYear(), 0, 1)
        break
      }
      case "total": {
        dataInicio = new Date(2020, 0, 1)
        break
      }
      case "personalizado": {
        if (!de || !ate) {
          return NextResponse.json({ error: "Período personalizado requer 'de' e 'ate'" }, { status: 400 })
        }
        dataInicio = new Date(de)
        dataInicio.setHours(0, 0, 0, 0)
        break
      }
      default: {
        dataInicio = new Date(agora.getFullYear(), 0, 1)
      }
    }

    const dataFim = periodo === "personalizado" && ate ? new Date(ate) : agora
    dataFim.setHours(23, 59, 59, 999)

    const presencas = await prisma.presenca.findMany({
      where: {
        alunoId: session.user.id,
        status: "confirmed",
        data: { gte: dataInicio, lte: dataFim },
      },
      select: {
        id: true,
        data: true,
        horario: true,
        turma: true,
        duracaoMinutos: true,
      },
      orderBy: { data: "desc" },
    })

    let totalMinutos = 0
    const aulas: {
      id: string
      data: Date
      turma: string | null
      duracaoMinutos: number
    }[] = []

    for (const p of presencas) {
      const duracao = await calcularDuracaoMinutos(p, academiaId)
      totalMinutos += duracao
      aulas.push({
        id: p.id,
        data: p.data,
        turma: p.turma,
        duracaoMinutos: duracao,
      })
    }

    const horasTotal = totalMinutos / 60

    const presencasAll = await prisma.presenca.findMany({
      where: { alunoId: session.user.id, status: "confirmed" },
      select: { data: true, horario: true, turma: true, duracaoMinutos: true },
    })

    let totalAllMinutos = 0
    for (const p of presencasAll) {
      totalAllMinutos += await calcularDuracaoMinutos(p, academiaId)
    }

    const horasAllTime = totalAllMinutos / 60

    const porMesMap = new Map<string, number>()
    const porSemanaMap = new Map<string, number>()
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

    for (const a of aulas) {
      const d = new Date(a.data)
      const mesKey = `${meses[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`
      porMesMap.set(mesKey, (porMesMap.get(mesKey) || 0) + a.duracaoMinutos)

      const semanaInicio = new Date(d)
      const diaSem = d.getDay()
      const diffDias = diaSem === 0 ? 6 : diaSem - 1
      semanaInicio.setDate(d.getDate() - diffDias)
      const semanaKey = `${semanaInicio.getDate()}/${meses[semanaInicio.getMonth()]}`
      porSemanaMap.set(semanaKey, (porSemanaMap.get(semanaKey) || 0) + a.duracaoMinutos)
    }

    const horasPorMes = Array.from(porMesMap.entries())
      .map(([mes, min]) => ({ mes, horas: +(min / 60).toFixed(1) }))
      .reverse()

    const horasPorSemana = Array.from(porSemanaMap.entries())
      .map(([semana, min]) => ({ semana, horas: +(min / 60).toFixed(1) }))
      .reverse()
      .slice(-12)

    const diasAtivos = new Set(aulas.map((a) => new Date(a.data).toDateString())).size
    const mediaPorDia = diasAtivos > 0 ? +(totalMinutos / diasAtivos / 60).toFixed(1) : 0

    const mesesNoPeriodo = Math.max(1, Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (30 * 24 * 60 * 60 * 1000)))
    const mediaPorMes = +(horasTotal / mesesNoPeriodo).toFixed(1)

    return NextResponse.json({
      horasNoPeriodo: +horasTotal.toFixed(1),
      horasTotal: +horasAllTime.toFixed(1),
      totalAulas: aulas.length,
      totalAulasAll: presencasAll.length,
      diasAtivos,
      mediaPorDia,
      mediaPorMes,
      horasPorMes,
      horasPorSemana,
      aulas: aulas.slice(0, 30),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

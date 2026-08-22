import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

const MINUTOS_PADRAO = 60

function parseHorario(h: string): number | null {
  const [hStr, mStr] = h.split(":")
  const horas = parseInt(hStr, 10)
  const minutos = parseInt(mStr, 10)
  if (isNaN(horas) || isNaN(minutos)) return null
  return horas * 60 + minutos
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const user = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      select: { academiaId: true, role: true },
    })
    if (!user?.academiaId || user.role !== "dono") {
      return NextResponse.json({ error: "Apenas o dono pode executar" }, { status: 403 })
    }

    const academiaId = user.academiaId

    const presencas = await prisma.presenca.findMany({
      where: {
        aluno: { academiaId },
        status: "confirmed",
        duracaoMinutos: null,
      },
      select: {
        id: true,
        data: true,
        horario: true,
        turma: true,
      },
    })

    let atualizadas = 0
    let erros = 0

    for (const p of presencas) {
      try {
        const diaSemana = p.data.getDay()
        let duracao = MINUTOS_PADRAO

        if (p.turma) {
          const horario = await prisma.horarioAula.findFirst({
            where: {
              academiaId,
              turma: { nome: p.turma },
              diaSemana,
            },
          })
          if (horario) {
            const inicio = parseHorario(horario.horaInicio)
            const fim = parseHorario(horario.horaFim)
            if (inicio !== null && fim !== null && fim > inicio) {
              duracao = fim - inicio
            }
          }
        } else {
          const checkinMinutos = parseHorario(p.horario)
          if (checkinMinutos !== null) {
            const horarios = await prisma.horarioAula.findMany({
              where: { academiaId, diaSemana },
            })
            for (const h of horarios) {
              const inicio = parseHorario(h.horaInicio)
              const fim = parseHorario(h.horaFim)
              if (inicio !== null && fim !== null && checkinMinutos >= inicio - 15 && checkinMinutos <= inicio + 15) {
                duracao = fim - inicio
                break
              }
            }
          }
        }

        await prisma.presenca.update({
          where: { id: p.id },
          data: { duracaoMinutos: duracao },
        })
        atualizadas++
      } catch {
        erros++
      }
    }

    return NextResponse.json({
      total: presencas.length,
      atualizadas,
      erros,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

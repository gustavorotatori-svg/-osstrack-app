import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  const results: Record<string, any> = {}
  try { results.academia = await prisma.academia.count() } catch (e: any) { results.academia = e.message }
  try { results.usuario = await prisma.usuario.count() } catch (e: any) { results.usuario = e.message }
  try { results.presenca = await prisma.presenca.count() } catch (e: any) { results.presenca = e.message }
  try { results.graduacao = await prisma.graduacao.count() } catch (e: any) { results.graduacao = e.message }
  try { results.turma = await prisma.turma.count() } catch (e: any) { results.turma = e.message }
  try { results.notificacao = await prisma.notificacao.count() } catch (e: any) { results.notificacao = e.message }
  try { results.conquista = await prisma.conquista.count() } catch (e: any) { results.conquista = e.message }
  try { results.streak = await prisma.streak.count() } catch (e: any) { results.streak = e.message }
  try { results.plano = await prisma.planoMensalidade.count() } catch (e: any) { results.plano = e.message }
  try { results.contrato = await prisma.contrato.count() } catch (e: any) { results.contrato = e.message }
  try { results.cobranca = await prisma.cobranca.count() } catch (e: any) { results.cobranca = e.message }
  try { results.horarioAula = await prisma.horarioAula.count() } catch (e: any) { results.horarioAula = e.message }
  try { results.agendamento = await prisma.agendamento.count() } catch (e: any) { results.agendamento = e.message }

  return NextResponse.json(results)
}

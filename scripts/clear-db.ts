import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  console.log("Limpando todos os dados...")

  await prisma.agendamento.deleteMany()
  await prisma.comentarioMural.deleteMany()
  await prisma.curtidaMural.deleteMany()
  await prisma.cobranca.deleteMany()
  await prisma.contrato.deleteMany()
  await prisma.planoMensalidade.deleteMany()
  await prisma.alunoConquista.deleteMany()
  await prisma.mestreDoMes.deleteMany()
  await prisma.horarioAula.deleteMany()
  await prisma.turmaAluno.deleteMany()
  await prisma.metaSemanal.deleteMany()
  await prisma.missaoDiaria.deleteMany()
  await prisma.notificacao.deleteMany()
  await prisma.postagemMural.deleteMany()
  await prisma.presenca.deleteMany()
  await prisma.streak.deleteMany()
  await prisma.convite.deleteMany()
  await prisma.turma.deleteMany()
  await prisma.graduacao.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.academia.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.contato.deleteMany()

  console.log("Banco zerado com sucesso!")
}

main().catch(console.error).finally(() => prisma.$disconnect())

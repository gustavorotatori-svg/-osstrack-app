import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const tables = [
    "CurtidaMural", "ComentarioMural", "PostagemMural",
    "MissaoDiaria", "MetaSemanal", "MestreDoMes",
    "AlunoConquista", "Agendamento", "Presenca",
    "TurmaAluno", "Cobranca", "Contrato", "PlanoMensalidade",
    "Notificacao", "HorarioAula", "Turma", "Graduacao",
    "Conquista", "Streak", "Pagamento",
    "Convite", "Usuario", "Academia", "Contato",
  ]
  for (const t of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${t}"`)
  }
  console.log("Todos os dados foram zerados.")
}

main().catch(console.error).finally(() => prisma.$disconnect())

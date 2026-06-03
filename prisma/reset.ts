import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🗑️ Resetando banco de dados...\n")

  const orders = [
    "comentarioMural", "postagemMural", "missaoDiaria", "metaSemanal",
    "mestreDoMes", "alunoConquista", "alunoConquista",
    "notificacao", "presenca", "streak", "pagamento",
    "agendamento", "horarioAula", "turmaAluno", "convite",
    "turma", "graduacao", "usuario", "academia",
  ]

  for (const table of orders) {
    const model = table as keyof typeof prisma
    if (typeof (prisma as any)[model]?.deleteMany === "function") {
      await (prisma as any)[model].deleteMany()
      console.log(`  ✓ ${table}`)
    }
  }

  console.log("\n✅ Banco resetado com sucesso!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

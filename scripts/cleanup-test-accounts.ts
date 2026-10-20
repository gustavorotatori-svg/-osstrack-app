import { PrismaClient } from "@prisma/client"
const p = new PrismaClient()

async function main() {
  const tables = await p.$queryRawUnsafe<Array<{ tablename: string }>>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
  )
  console.log("Tabelas:", tables.map((t) => t.tablename).join(", "))

  for (const t of tables) {
    const cols = await p.$queryRawUnsafe<Array<{ column_name: string }>>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = '${t.tablename}' AND column_name = 'usuarioId'`
    )
    if (cols.length > 0) {
      console.log(`  ${t.tablename} tem usuarioId`)
      await p.$executeRawUnsafe(
        `DELETE FROM "${t.tablename}" WHERE "usuarioId" IN (SELECT id FROM "Usuario" WHERE email LIKE '%@test.com')`
      )
    }
    const cols2 = await p.$queryRawUnsafe<Array<{ column_name: string }>>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = '${t.tablename}' AND column_name = 'alunoId'`
    )
    if (cols2.length > 0) {
      console.log(`  ${t.tablename} tem alunoId`)
      await p.$executeRawUnsafe(
        `DELETE FROM "${t.tablename}" WHERE "alunoId" IN (SELECT id FROM "Usuario" WHERE email LIKE '%@test.com')`
      )
    }
  }

  await p.$executeRawUnsafe(`DELETE FROM "Convite" WHERE email LIKE '%@test.com'`)
  const deleted = await p.$executeRawUnsafe(
    `DELETE FROM "Usuario" WHERE email LIKE '%@test.com'`
  )
  console.log("Usuarios removidos:", deleted)
}

main().finally(() => p.$disconnect())

const { PrismaClient } = require("@prisma/client")
const p = new PrismaClient()
async function main() {
  const [u, a, pr] = await Promise.all([
    p.usuario.count(),
    p.academia.count(),
    p.presenca.count()
  ])
  console.log("Usuarios:", u)
  console.log("Academias:", a)
  console.log("Presencas:", pr)
}
main().catch(e => console.error(e)).finally(() => p.$disconnect())

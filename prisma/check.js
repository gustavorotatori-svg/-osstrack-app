const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.usuario.findMany({
    take: 5,
    select: { email: true, role: true, faixa: true }
  });
  console.log('Users:', JSON.stringify(users, null, 2));
  
  const count = await prisma.usuario.count();
  console.log('Total users:', count);
}

main().catch(console.error).finally(() => prisma.$disconnect());

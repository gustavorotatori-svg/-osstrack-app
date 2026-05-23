const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.academia.findFirst({ where: { nome: "Caveirinha Jiu-Jitsu" } })
  if (existing) {
    console.log("Segunda academia já existe. Pulando...")
    return
  }

  const senha = await bcrypt.hash("123456", 10)

  const graduacoes = [
    { faixa: "Branca", graus: 4, aulasPorGrau: 20, aulasProxFx: 100 },
    { faixa: "Azul", graus: 4, aulasPorGrau: 25, aulasProxFx: 200 },
    { faixa: "Roxa", graus: 4, aulasPorGrau: 30, aulasProxFx: 300 },
    { faixa: "Marrom", graus: 4, aulasPorGrau: 35, aulasProxFx: 400 },
    { faixa: "Preta", graus: 6, aulasPorGrau: 40, aulasProxFx: null },
  ]

  const academia = await prisma.academia.create({
    data: {
      nome: "Caveirinha Jiu-Jitsu",
      endereco: "Av. Boa Viagem, 500",
      cidade: "Recife",
      estado: "PE",
      lat: -8.126,
      lng: -34.902,
      raio: 200,
      responsavel: "Felipe Costa",
      telefone: "(81) 98888-7777",
    },
  })

  await prisma.usuario.create({
    data: {
      nome: "Felipe Costa",
      email: "felipe@email.com",
      senha,
      role: "dono",
      telefone: "(81) 98888-7777",
      faixa: "Preta",
      grau: 4,
      academiaId: academia.id,
    },
  })

  const prof = await prisma.usuario.create({
    data: {
      nome: "Marcos Paulo",
      email: "marcos@email.com",
      senha,
      role: "professor",
      telefone: "(81) 97777-6666",
      faixa: "Roxa",
      grau: 2,
      academiaId: academia.id,
    },
  })

  const aluno = await prisma.usuario.create({
    data: {
      nome: "João Vitor",
      email: "joao@email.com",
      senha,
      role: "aluno",
      telefone: "(81) 96666-5555",
      faixa: "Branca",
      grau: 1,
      dataInicio: new Date("2025-06-01"),
      categoria: "adulto",
      academiaId: academia.id,
      professorId: prof.id,
      plano: "premium",
      planoInicio: new Date(),
      planoExpiracao: new Date(Date.now() + 30 * 86400000),
    },
  })

  await prisma.streak.create({
    data: { usuarioId: aluno.id, currentStreak: 0, bestStreak: 0 },
  })

  for (const g of graduacoes) {
    await prisma.graduacao.create({
      data: { ...g, academiaId: academia.id, categoria: "adulto" },
    })
  }

  console.log("✅ Segunda academia criada! Caveirinha Jiu-Jitsu")
  console.log("   Dono: felipe@email.com / 123456")
  console.log("   Professor: marcos@email.com / 123456")
  console.log("   Aluno: joao@email.com / 123456 (Premium)")
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())

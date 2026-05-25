const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function upsertAcademia(data) {
  const existing = await prisma.academia.findFirst({ where: { nome: data.nome } })
  if (existing) return existing
  return prisma.academia.create({ data })
}

async function upsertUsuario(data) {
  const existing = await prisma.usuario.findUnique({ where: { email: data.email } })
  if (existing) return existing
  return prisma.usuario.create({ data })
}

async function main() {
  const senha = await bcrypt.hash("123456", 10)

  // --- ACADEMIA 1: Gracie Barra Recife ---
  const academia1 = await upsertAcademia({
    nome: "Gracie Barra Recife",
    endereco: "Rua da Academia, 123",
    cidade: "Recife",
    estado: "PE",
    lat: -8.0476,
    lng: -34.877,
    raio: 200,
    responsavel: "Carlos Silva",
    telefone: "(81) 99999-8888",
  })

  const dono1 = await upsertUsuario({
    nome: "Carlos Silva",
    email: "carlos@email.com",
    senha,
    role: "dono",
    telefone: "(81) 99999-8888",
    faixa: "Preta",
    grau: 3,
    academiaId: academia1.id,
  })

  const prof1 = await upsertUsuario({
    nome: "Leandro Souza",
    email: "leandro@email.com",
    senha,
    role: "professor",
    telefone: "(81) 88888-7777",
    faixa: "Preta",
    grau: 3,
    academiaId: academia1.id,
  })

  await upsertUsuario({
    nome: "Rafael Oliveira",
    email: "rafael@email.com",
    senha,
    role: "aluno",
    telefone: "(81) 77777-6666",
    faixa: "Azul",
    grau: 2,
    dataInicio: new Date("2024-01-15"),
    categoria: "adulto",
    academiaId: academia1.id,
    professorId: prof1.id,
    plano: "free",
  })

  // --- ACADEMIA 2: Caveirinha Jiu-Jitsu ---
  const academia2 = await upsertAcademia({
    nome: "Caveirinha Jiu-Jitsu",
    endereco: "Av. Boa Viagem, 500",
    cidade: "Recife",
    estado: "PE",
    lat: -8.126,
    lng: -34.902,
    raio: 200,
    responsavel: "Felipe Costa",
    telefone: "(81) 98888-7777",
  })

  await upsertUsuario({
    nome: "Felipe Costa",
    email: "felipe@email.com",
    senha,
    role: "dono",
    telefone: "(81) 98888-7777",
    faixa: "Preta",
    grau: 4,
    academiaId: academia2.id,
  })

  const prof2 = await upsertUsuario({
    nome: "Marcos Paulo",
    email: "marcos@email.com",
    senha,
    role: "professor",
    telefone: "(81) 97777-6666",
    faixa: "Roxa",
    grau: 2,
    academiaId: academia2.id,
  })

  await upsertUsuario({
    nome: "João Vitor",
    email: "joao@email.com",
    senha,
    role: "aluno",
    telefone: "(81) 96666-5555",
    faixa: "Branca",
    grau: 1,
    dataInicio: new Date("2025-06-01"),
    categoria: "adulto",
    academiaId: academia2.id,
    professorId: prof2.id,
    plano: "premium",
  })

  // Graduações (só cria se não existir nenhuma)
  const existingGrads = await prisma.graduacao.count()
  if (existingGrads === 0) {
    const grads = [
      { faixa: "Branca", graus: 4, aulasPorGrau: 20, aulasProxFx: 100 },
      { faixa: "Azul", graus: 4, aulasPorGrau: 25, aulasProxFx: 200 },
      { faixa: "Roxa", graus: 4, aulasPorGrau: 30, aulasProxFx: 300 },
      { faixa: "Marrom", graus: 4, aulasPorGrau: 35, aulasProxFx: 400 },
      { faixa: "Preta", graus: 6, aulasPorGrau: 40, aulasProxFx: null },
    ]
    for (const g of grads) {
      await prisma.graduacao.create({ data: { ...g, academiaId: academia1.id, categoria: "adulto" } })
      await prisma.graduacao.create({ data: { ...g, academiaId: academia2.id, categoria: "adulto" } })
    }
  }

  // Conquistas
  const existingConquistas = await prisma.conquista.count()
  if (existingConquistas === 0) {
    const c = [
      { nome: "Primeiro Check-in", icone: "🎯", descricao: "Primeiro treino registrado", tipo: "primeiro", condicao: 1 },
      { nome: "Dedicação", icone: "🔥", descricao: "5 dias consecutivos de treino", tipo: "streak", condicao: 5 },
      { nome: "Guerreiro", icone: "⚔️", descricao: "50 aulas completadas", tipo: "aulas", condicao: 50 },
      { nome: "Centenário", icone: "💯", descricao: "100 aulas completadas", tipo: "aulas", condicao: 100 },
      { nome: "Maratona", icone: "🏃", descricao: "20 dias em um mês", tipo: "mensal", condicao: 20 },
    ]
    for (const x of c) await prisma.conquista.create({ data: x })
  }

  console.log("✅ Seed concluído!")
}

main()
  .catch((e) => { console.error(e); process.exit(0) })
  .finally(() => prisma.$disconnect())

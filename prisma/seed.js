const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  const senha = await bcrypt.hash("123456", 10)

  const academia = await prisma.academia.create({
    data: {
      nome: "Gracie Barra Recife",
      endereco: "Rua da Academia, 123",
      cidade: "Recife",
      estado: "PE",
      lat: -8.0476,
      lng: -34.877,
      raio: 200,
      responsavel: "Carlos Silva",
      telefone: "(81) 99999-8888",
    },
  })

  const dono = await prisma.usuario.create({
    data: {
      nome: "Carlos Silva",
      email: "carlos@email.com",
      senha,
      role: "dono",
      telefone: "(81) 99999-8888",
      faixa: "Preta",
      grau: 3,
      academiaId: academia.id,
    },
  })

  const professor = await prisma.usuario.create({
    data: {
      nome: "Leandro Souza",
      email: "leandro@email.com",
      senha,
      role: "professor",
      telefone: "(81) 88888-7777",
      faixa: "Preta",
      grau: 3,
      academiaId: academia.id,
    },
  })

  const aluno = await prisma.usuario.create({
    data: {
      nome: "Rafael Oliveira",
      email: "rafael@email.com",
      senha,
      role: "aluno",
      telefone: "(81) 77777-6666",
      faixa: "Azul",
      grau: 2,
      dataInicio: new Date("2024-01-15"),
      categoria: "adulto",
      academiaId: academia.id,
      professorId: professor.id,
      plano: "free",
      planoInicio: new Date(),
      planoExpiracao: new Date(Date.now() + 30 * 86400000),
    },
  })

  await prisma.streak.create({
    data: { usuarioId: aluno.id, currentStreak: 3, bestStreak: 3, lastCheckinDate: new Date("2026-05-14") },
  })

  const turma1 = await prisma.turma.create({
    data: {
      nome: "Jiu-Jitsu Adulto",
      horario: "18:30",
      dias: "Seg,Ter,Qua,Qui,Sex",
      maxAlunos: 30,
      academiaId: academia.id,
      professorId: professor.id,
    },
  })

  const turma2 = await prisma.turma.create({
    data: {
      nome: "Jiu-Jitsu Infantil",
      horario: "17:30",
      dias: "Seg,Qua,Sex",
      maxAlunos: 20,
      academiaId: academia.id,
      professorId: professor.id,
    },
  })

  await prisma.turmaAluno.create({
    data: { turmaId: turma1.id, alunoId: aluno.id },
  })

  await prisma.presenca.createMany({
    data: [
      { alunoId: aluno.id, data: new Date("2026-05-14"), horario: "18:30", status: "confirmed", turma: "Jiu-Jitsu Adulto", confirmadoPor: professor.id },
      { alunoId: aluno.id, data: new Date("2026-05-13"), horario: "18:30", status: "confirmed", turma: "Jiu-Jitsu Adulto", confirmadoPor: professor.id },
      { alunoId: aluno.id, data: new Date("2026-05-12"), horario: "18:30", status: "confirmed", turma: "Jiu-Jitsu Adulto", confirmadoPor: professor.id },
    ],
  })

  const graduacoes = [
    { faixa: "Branca", graus: 4, aulasPorGrau: 20, aulasProxFx: 100 },
    { faixa: "Azul", graus: 4, aulasPorGrau: 25, aulasProxFx: 200 },
    { faixa: "Roxa", graus: 4, aulasPorGrau: 30, aulasProxFx: 300 },
    { faixa: "Marrom", graus: 4, aulasPorGrau: 35, aulasProxFx: 400 },
    { faixa: "Preta", graus: 6, aulasPorGrau: 40, aulasProxFx: null },
  ]

  for (const g of graduacoes) {
    await prisma.graduacao.create({
      data: { ...g, academiaId: academia.id, categoria: "adulto" },
    })
  }

  // === SEGUNDA ACADEMIA ===
  const academia2 = await prisma.academia.create({
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
      academiaId: academia2.id,
    },
  })

  const prof2 = await prisma.usuario.create({
    data: {
      nome: "Marcos Paulo",
      email: "marcos@email.com",
      senha,
      role: "professor",
      telefone: "(81) 97777-6666",
      faixa: "Roxa",
      grau: 2,
      academiaId: academia2.id,
    },
  })

  const aluno2 = await prisma.usuario.create({
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
      academiaId: academia2.id,
      professorId: prof2.id,
      plano: "premium",
      planoInicio: new Date(),
      planoExpiracao: new Date(Date.now() + 30 * 86400000),
    },
  })

  for (const g of graduacoes) {
    await prisma.graduacao.create({
      data: { ...g, academiaId: academia2.id, categoria: "adulto" },
    })
  }

  const conquistas = [
    { nome: "Primeiro Check-in", icone: "🎯", descricao: "Primeiro treino registrado", tipo: "primeiro", condicao: 1 },
    { nome: "Dedicação", icone: "🔥", descricao: "5 dias consecutivos de treino", tipo: "streak", condicao: 5 },
    { nome: "Guerreiro", icone: "⚔️", descricao: "50 aulas completadas", tipo: "aulas", condicao: 50 },
    { nome: "Centenário", icone: "💯", descricao: "100 aulas completadas", tipo: "aulas", condicao: 100 },
    { nome: "Maratona", icone: "🏃", descricao: "20 dias em um mês", tipo: "mensal", condicao: 20 },
  ]

  for (const c of conquistas) {
    await prisma.conquista.create({ data: c })
  }

  console.log("✅ Seed concluído!")
  console.log("   Academia 1 — Gracie Barra Recife")
  console.log("     Dono: carlos@email.com / 123456")
  console.log("     Professor: leandro@email.com / 123456")
  console.log("     Aluno: rafael@email.com / 123456")
  console.log("   Academia 2 — Caveirinha Jiu-Jitsu")
  console.log("     Dono: felipe@email.com / 123456")
  console.log("     Professor: marcos@email.com / 123456")
  console.log("     Aluno: joao@email.com / 123456 (Premium)")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

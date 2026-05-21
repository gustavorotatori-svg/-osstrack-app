import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Limpando banco...")
  await prisma.postagemMural.deleteMany()
  await prisma.missaoDiaria.deleteMany()
  await prisma.metaSemanal.deleteMany()
  await prisma.mestreDoMes.deleteMany()
  await prisma.alunoConquista.deleteMany()
  await prisma.presenca.deleteMany()
  await prisma.turmaAluno.deleteMany()
  await prisma.turma.deleteMany()
  await prisma.graduacao.deleteMany()
  await prisma.conquista.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.academia.deleteMany()

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

  await prisma.usuario.createMany({
    data: [
      { nome: "Carlos Silva", email: "carlos@email.com", senha, role: "dono", telefone: "(81) 99999-8888", faixa: "Preta", grau: 3, academiaId: academia.id },
      { nome: "Leandro Souza", email: "leandro@email.com", senha, role: "professor", telefone: "(81) 88888-7777", faixa: "Preta", grau: 3, academiaId: academia.id },
      { nome: "Rafael Oliveira", email: "rafael@email.com", senha, role: "aluno", telefone: "(81) 77777-6666", faixa: "Azul", grau: 2, dataInicio: new Date("2024-01-15"), categoria: "adulto", academiaId: academia.id },
    ],
  })

  const professor = (await prisma.usuario.findFirst({ where: { role: "professor" } }))!
  const aluno = (await prisma.usuario.findFirst({ where: { role: "aluno" } }))!
  await prisma.usuario.update({ where: { id: aluno.id }, data: { professorId: professor.id } })

  const turma = await prisma.turma.create({
    data: { nome: "Jiu-Jitsu Adulto", horario: "18:30", dias: "Seg,Ter,Qua,Qui,Sex", maxAlunos: 30, academiaId: academia.id, professorId: professor.id },
  })

  console.log("Criando graduações...")
  const graduacoes = [
    { faixa: "Branca", graus: 4, aulasPorGrau: 20, aulasProxFx: 100 },
    { faixa: "Azul", graus: 4, aulasPorGrau: 25, aulasProxFx: 200 },
    { faixa: "Roxa", graus: 4, aulasPorGrau: 30, aulasProxFx: 300 },
    { faixa: "Marrom", graus: 4, aulasPorGrau: 35, aulasProxFx: 400 },
    { faixa: "Preta", graus: 6, aulasPorGrau: 40, aulasProxFx: null },
  ]
  for (const g of graduacoes) {
    await prisma.graduacao.create({ data: { ...g, academiaId: academia.id, categoria: "adulto" } })
  }

  console.log("Criando presenças e matrícula...")
  await prisma.turmaAluno.create({ data: { turmaId: turma.id, alunoId: aluno.id } })

  const now = new Date()
  const presencas = []
  for (let d = 0; d < 15; d++) {
    const dia = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d)
    if (dia.getDay() !== 0 && dia.getDay() !== 6) {
      presencas.push({
        alunoId: aluno.id,
        data: dia,
        horario: "18:30",
        status: "confirmed",
        turma: "Jiu-Jitsu Adulto",
        confirmadoPor: professor.id,
      })
    }
  }
  if (presencas.length > 0) {
    await prisma.presenca.createMany({ data: presencas })
  }

  console.log("Criando Mestre do Mês...")
  await prisma.mestreDoMes.create({
    data: { academiaId: academia.id, alunoId: aluno.id, mes: now.getMonth() + 1, ano: now.getFullYear(), totalAulas: presencas.length },
  })

  console.log("Criando conquistas...")
  await prisma.conquista.createMany({
    data: [
      { nome: "Primeiro Check-in", icone: "✅", descricao: "Fez o primeiro check-in", tipo: "primeiro", condicao: 1 },
      { nome: "Sequência de Bronze", icone: "🥉", descricao: "5 dias seguidos de treino", tipo: "streak", condicao: 5 },
      { nome: "Sequência de Prata", icone: "🥈", descricao: "7 dias seguidos de treino", tipo: "streak", condicao: 7 },
      { nome: "Sequência de Ouro", icone: "🥇", descricao: "10 dias seguidos de treino", tipo: "streak", condicao: 10 },
      { nome: "Dedicação Total", icone: "🔥", descricao: "50 aulas confirmadas", tipo: "aulas", condicao: 50 },
      { nome: "Veterano", icone: "⚡", descricao: "100 aulas confirmadas", tipo: "aulas", condicao: 100 },
      { nome: "Maratona", icone: "🏃", descricao: "30 aulas em um mês", tipo: "mensal", condicao: 30 },
    ],
  })

  console.log("Banco populado com sucesso!")
  console.log("Contas:")
  console.log("  Dono: carlos@email.com / 123456")
  console.log("  Professor: leandro@email.com / 123456")
  console.log("  Aluno: rafael@email.com / 123456")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

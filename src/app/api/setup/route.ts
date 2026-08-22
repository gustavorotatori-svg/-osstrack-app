import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    // Protected: only allowed in development or with explicit flag
    if (process.env.NODE_ENV === "production" && !process.env.ALLOW_SETUP) {
      return NextResponse.json({ error: "Não disponível em produção" }, { status: 403 })
    }

    // Same-Origin check (CSRF protection)
    const origin = request.headers.get("origin") || request.headers.get("referer") || ""
    const allowedOrigins = [
      "http://localhost:3000",
      "https://osstrack-app.vercel.app",
      "https://osstrack.app",
      "https://osstrack.com.br",
    ]
    if (!allowedOrigins.some((o) => origin.startsWith(o))) {
      return NextResponse.json({ error: "Origem não permitida" }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const force = body?.force === true

    if (force) {
      await prisma.postagemMural.deleteMany()
      await prisma.missaoDiaria.deleteMany()
      await prisma.progressoSemanal.deleteMany()
      await prisma.alunoDoMes.deleteMany()
      await prisma.alunoConquista.deleteMany()
      await prisma.presenca.deleteMany()
      await prisma.turmaAluno.deleteMany()
      await prisma.turma.deleteMany()
      await prisma.graduacao.deleteMany()
      await prisma.conquista.deleteMany()
      await prisma.usuario.deleteMany()
      await prisma.academia.deleteMany()
    }

    const existing = await prisma.usuario.findFirst()
    if (existing && !force) {
      return NextResponse.json({ message: "Banco já populado. Use ?force=true para recriar.", count: 3 })
    }

    const senha = await bcrypt.hash("123456", 10)

    const academia = await prisma.academia.create({
      data: {
        nome: "Academia Modelo",
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

    const professor = await prisma.usuario.findFirst({ where: { role: "professor" } })
    const aluno = await prisma.usuario.findFirst({ where: { role: "aluno" } })
    if (professor && aluno) {
      await prisma.usuario.update({ where: { id: aluno.id }, data: { professorId: professor.id } })
    }

    const turma = await prisma.turma.create({
      data: { nome: "Jiu-Jitsu Adulto", horario: "18:30", dias: "Seg,Ter,Qua,Qui,Sex", maxAlunos: 30, academiaId: academia.id, professorId: professor!.id },
    })

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

    if (aluno && turma) {
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
            confirmadoPor: professor!.id,
          })
        }
      }
      if (presencas.length > 0) {
        await prisma.presenca.createMany({ data: presencas })
      }

      await prisma.alunoDoMes.create({
        data: { academiaId: academia.id, alunoId: aluno.id, mes: now.getMonth() + 1, ano: now.getFullYear(), totalAulas: presencas.length },
      })
    }

    const conquistas = await prisma.conquista.createMany({
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

    return NextResponse.json({
      message: "Banco populado com sucesso!",
      contas: {
        dono: "carlos@email.com / 123456",
        professor: "leandro@email.com / 123456",
        aluno: "rafael@email.com / 123456",
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao popular banco" }, { status: 500 })
  }
}

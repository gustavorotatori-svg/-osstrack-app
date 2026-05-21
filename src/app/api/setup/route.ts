import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const existing = await prisma.usuario.findFirst()
    if (existing) {
      return NextResponse.json({ message: "Banco já populado", users: 3 })
    }

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

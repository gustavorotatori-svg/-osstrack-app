import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

export async function GET() {
  const prisma = new PrismaClient()
  try {
    const existing = await prisma.usuario.count()
    if (existing > 0) return NextResponse.json({ message: "Banco já tem dados", users: existing })

    const senha = await bcrypt.hash("123456", 10)

    const academia = await prisma.academia.create({
      data: { nome: "Gracie Barra Recife", endereco: "Rua da Academia, 123", cidade: "Recife", estado: "PE", lat: -8.0476, lng: -34.877, raio: 200, responsavel: "Carlos Silva", telefone: "(81) 99999-8888" },
    })

    const dono = await prisma.usuario.create({ data: { nome: "Carlos Silva", email: "carlos@email.com", senha, role: "dono", telefone: "(81) 99999-8888", faixa: "Preta", grau: 3, academiaId: academia.id } })

    const prof = await prisma.usuario.create({ data: { nome: "Leandro Souza", email: "leandro@email.com", senha, role: "professor", telefone: "(81) 88888-7777", faixa: "Preta", grau: 3, academiaId: academia.id } })

    await prisma.usuario.create({ data: { nome: "Rafael Oliveira", email: "rafael@email.com", senha, role: "aluno", telefone: "(81) 77777-6666", faixa: "Azul", grau: 2, dataInicio: new Date("2024-01-15"), categoria: "adulto", academiaId: academia.id, professorId: prof.id, plano: "free" } })

    const grads = [
      { faixa: "Branca", graus: 4, aulasPorGrau: 20, aulasProxFx: 100 },
      { faixa: "Azul", graus: 4, aulasPorGrau: 25, aulasProxFx: 200 },
      { faixa: "Roxa", graus: 4, aulasPorGrau: 30, aulasProxFx: 300 },
      { faixa: "Marrom", graus: 4, aulasPorGrau: 35, aulasProxFx: 400 },
      { faixa: "Preta", graus: 6, aulasPorGrau: 40, aulasProxFx: null },
    ]
    for (const g of grads) {
      await prisma.graduacao.create({ data: { ...g, academiaId: academia.id, categoria: "adulto" } })
    }

    await prisma.$disconnect()
    return NextResponse.json({ message: "Seed concluído!", users: ["carlos@email.com", "leandro@email.com", "rafael@email.com"] })
  } catch (e: any) {
    await prisma.$disconnect()
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

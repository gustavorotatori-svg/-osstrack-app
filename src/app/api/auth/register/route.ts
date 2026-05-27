import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, email, telefone, senha, role } = body

    if (!nome || !email || !senha || !role) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
    }

    const existing = await prisma.usuario.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Este e-mail já está cadastrado" }, { status: 409 })
    }

    const hashed = await bcrypt.hash(senha, 10)

    if (body.codigoConvite) {
      const convite = await prisma.convite.findUnique({ where: { codigo: body.codigoConvite } })
      if (convite && !convite.usado && (!convite.expiresAt || convite.expiresAt > new Date())) {
        await prisma.convite.update({ where: { id: convite.id }, data: { usado: true } })
        if (!body.academiaId && convite.academiaId) body.academiaId = convite.academiaId
      }
    }

    if (role === "dono") {
      const { academia } = body
      if (!academia?.nome) {
        return NextResponse.json({ error: "Dados da academia obrigatórios" }, { status: 400 })
      }

      const novaAcademia = await prisma.academia.create({
        data: {
          nome: academia.nome,
          endereco: academia.endereco || "",
          cidade: academia.cidade || "",
          estado: academia.estado || "",
          lat: academia.lat || 0,
          lng: academia.lng || 0,
          raio: academia.raio || 200,
          responsavel: nome,
          telefone: telefone || "",
        },
      })

      await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: hashed,
          telefone: telefone || "",
          role: "dono",
          faixa: "Preta",
          grau: 3,
          academiaId: novaAcademia.id,
        },
      })

      const modalidades = academia.modalidades
      if (modalidades?.length > 0) {
        await prisma.graduacao.createMany({
          data: modalidades.map((m: string) => ({
            academiaId: novaAcademia.id,
            categoria: "adulto",
            faixa: "Branca",
            graus: 4,
            aulasPorGrau: 20,
            aulasProxFx: 100,
          })),
        })
      }

      return NextResponse.json({ redirect: "/dashboard/dono" })
    }

    if (role === "professor") {
      const usuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: hashed,
          telefone: telefone || "",
          role: "professor",
          faixa: "Preta",
          grau: 3,
          academiaId: body.academiaId || null,
        },
      })
      return NextResponse.json({ redirect: "/dashboard/professor" })
    }

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hashed,
        telefone: telefone || "",
        role: "aluno",
        faixa: "Branca",
        grau: 0,
        academiaId: body.academiaId || null,
        professorId: body.professorId || null,
      },
    })
    return NextResponse.json({ redirect: "/dashboard/aluno" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

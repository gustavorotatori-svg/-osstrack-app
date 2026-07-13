import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { registerSchema } from "@/lib/validation"
import { notificarUsuario } from "@/lib/notificar"

async function marcarConviteUsado(codigoConvite?: string) {
  if (!codigoConvite) return
  try {
    const convite = await prisma.convite.findUnique({ where: { codigo: codigoConvite } })
    if (convite && !convite.usado && (!convite.expiresAt || convite.expiresAt > new Date())) {
      await prisma.convite.update({ where: { id: convite.id }, data: { usado: true } })
    }
  } catch {} // non-critical
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Dados inválidos"
      return NextResponse.json({ error: firstError }, { status: 400 })
    }
    const {
      nome, email: rawEmail, telefone, senha, role, dataNascimento, recaptchaToken,
      academia: academiaData, codigoConvite, professorId,
      faixa, grau, academiaId: acId,
      aceitouTermos, aceitouLGPD, aceitouMarketing,
      endereco, cidade, estado, lat, lng, raio,
    } = parsed.data

    const email = rawEmail.toLowerCase().trim()

    // Rate limit by IP
    const ip = getClientIp(request)
    const ipCheck = await checkRateLimit(`ip:${ip}`, "register")
    if (!ipCheck.allowed) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente em 1 minuto." }, { status: 429 })
    }

    // Rate limit by email
    const emailCheck = await checkRateLimit(`email:${email}`, "register")
    if (!emailCheck.allowed) {
      return NextResponse.json({ error: "Muitas tentativas para este e-mail. Tente novamente em 1 minuto." }, { status: 429 })
    }

    // Verify recaptcha if secret is configured
    if (process.env.RECAPTCHA_SECRET_KEY) {
      if (!recaptchaToken) {
        return NextResponse.json({ error: "reCAPTCHA é obrigatório" }, { status: 400 })
      }
      const params = new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY, response: recaptchaToken })
      const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", { method: "POST", body: params })
      const verifyData = await verifyRes.json()
      if (!verifyData.success || (verifyData.score && verifyData.score < 0.5)) {
        return NextResponse.json({ error: "Falha na verificação de segurança. Tente novamente." }, { status: 400 })
      }
    }

    const existing = await prisma.usuario.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Este e-mail já está cadastrado" }, { status: 409 })
    }

    const hashed = await bcrypt.hash(senha, 10)

    if (role === "dono") {
      if (!academiaData?.nome) {
        return NextResponse.json({ error: "Dados da academia obrigatórios" }, { status: 400 })
      }

      const result = await prisma.$transaction(async (tx) => {
        const novaAcademia = await tx.academia.create({
          data: {
            nome: academiaData.nome,
            endereco: academiaData.endereco || "",
            cidade: academiaData.cidade || "",
            estado: academiaData.estado || "",
            lat: academiaData.lat || 0,
            lng: academiaData.lng || 0,
            raio: academiaData.raio || 200,
            responsavel: nome,
            telefone: telefone || "",
          },
        })

        const dono = await tx.usuario.create({
          data: {
            nome,
            email,
            senha: hashed,
            telefone: telefone || "",
            role: "dono",
            faixa: "Preta",
            grau: 3,
            dataNascimento: dataNascimento || null,
            academiaId: novaAcademia.id,
            dataInicio: new Date(),
            aceitouTermos: aceitouTermos || false,
            aceitouLGPD: aceitouLGPD || false,
            aceitouMarketing: aceitouMarketing || false,
            dataAceite: new Date(),
          },
        })

        await tx.notificacao.create({
          data: {
            usuarioId: dono.id,
            tipo: "boas_vindas",
            titulo: "Academia criada com sucesso!",
            descricao: "Sua academia já está no ar. Comece convidando professores e configurando as graduações.",
            link: "/dashboard/dono",
          },
        })

        await tx.graduacao.create({
          data: {
            academiaId: novaAcademia.id,
            categoria: "adulto",
            faixa: "Branca",
            graus: 4,
            aulasPorGrau: 20,
            aulasProxFx: 100,
          },
        })

        if (professorId) {
          await tx.usuario.update({
            where: { id: professorId },
            data: { academiaId: novaAcademia.id },
          })
        }

        // Marca convite DENTRO da transação
        if (codigoConvite) {
          const convite = await tx.convite.findUnique({ where: { codigo: codigoConvite } })
          if (convite && !convite.usado && (!convite.expiresAt || convite.expiresAt > new Date())) {
            await tx.convite.update({ where: { id: convite.id }, data: { usado: true } })
          }
        }

        return { redirect: "/dashboard/dono" }
      })

      return NextResponse.json(result)
    }

    if (role === "professor") {
      // Usa transação para evitar academia órfã se a criação do usuário falhar
      const result = await prisma.$transaction(async (tx) => {
        let academiaId = acId || null

        if (!academiaId) {
          const novaAcademia = await tx.academia.create({
            data: {
              nome: `Academia do ${nome.split(" ")[0]}`,
              endereco: endereco || "",
              cidade: cidade || "",
              estado: estado || "",
              lat: lat || 0,
              lng: lng || 0,
              raio: raio || 200,
              responsavel: nome,
              telefone: telefone || "",
            },
          })
          academiaId = novaAcademia.id

          await tx.graduacao.create({
            data: {
              academiaId: novaAcademia.id,
              categoria: "adulto",
              faixa: "Branca",
              graus: 4,
              aulasPorGrau: 20,
              aulasProxFx: 100,
            },
          })
        }

        const professor = await tx.usuario.create({
          data: {
            nome,
            email,
            senha: hashed,
            telefone: telefone || "",
            role: "professor",
            faixa: faixa || "Preta",
            grau: grau ?? 3,
            dataNascimento: dataNascimento || null,
            academiaId,
            dataInicio: new Date(),
            aceitouTermos: aceitouTermos || false,
            aceitouLGPD: aceitouLGPD || false,
            aceitouMarketing: aceitouMarketing || false,
            dataAceite: new Date(),
          },
        })

        await tx.notificacao.create({
          data: {
            usuarioId: professor.id,
            tipo: "boas_vindas",
            titulo: "Bem-vindo, professor!",
            descricao: "Sua conta foi criada. Crie sua primeira turma e comece a gerenciar seus alunos.",
            link: "/dashboard/professor",
          },
        })

        return { academiaId }
      })

      // Marca convite após criação confirmada (fora da transaction por ser não-crítico)
      if (codigoConvite) await marcarConviteUsado(codigoConvite)

      return NextResponse.json({ redirect: "/dashboard/professor" })
    }

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hashed,
        telefone: telefone || "",
        role: "aluno",
        faixa: faixa || "Branca",
        grau: grau ?? 2,
        dataNascimento: dataNascimento || null,
        academiaId: acId || null,
        professorId: professorId || null,
        dataInicio: new Date(),
        aceitouTermos: aceitouTermos || false,
        aceitouLGPD: aceitouLGPD || false,
        aceitouMarketing: aceitouMarketing || false,
        dataAceite: new Date(),
      },
    })

    await notificarUsuario({
      usuarioId: usuario.id,
      tipo: "boas_vindas",
      titulo: "Bem-vindo ao OssTrack!",
      descricao: "Sua jornada no Jiu-Jitsu comeca aqui. Faca check-in na sua academia e acompanhe sua evolucao.",
      link: "/dashboard/aluno",
    }).catch(() => {})

    await prisma.streak.create({
      data: { usuarioId: usuario.id, currentStreak: 0, bestStreak: 0 },
    })

    // Marca convite após criação confirmada
    if (codigoConvite) await marcarConviteUsado(codigoConvite)

    return NextResponse.json({ redirect: "/dashboard/aluno" })
  } catch (error: any) {
    console.error("Register error:", error?.message || error)
    const msg = error?.message?.includes("connect") ? "Erro de conexão com o banco de dados" : "Erro interno do servidor"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

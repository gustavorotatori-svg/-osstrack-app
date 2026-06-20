import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, email, telefone, senha, role, dataNascimento, recaptchaToken } = body

    // Rate limit by IP
    const ip = getClientIp(request)
    const ipCheck = await checkRateLimit(`ip:${ip}`, "register")
    if (!ipCheck.allowed) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente em 1 minuto." }, { status: 429 })
    }

    // Rate limit by email
    if (email) {
      const emailCheck = await checkRateLimit(`email:${email}`, "register")
      if (!emailCheck.allowed) {
        return NextResponse.json({ error: "Muitas tentativas para este e-mail. Tente novamente em 1 minuto." }, { status: 429 })
      }
    }

    // Verify recaptcha if secret is configured
    if (process.env.RECAPTCHA_SECRET_KEY) {
      if (!recaptchaToken) {
        return NextResponse.json({ error: "reCAPTCHA é obrigatório" }, { status: 400 })
      }
      const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
      const verifyRes = await fetch(verifyUrl, { method: "POST" })
      const verifyData = await verifyRes.json()
      if (!verifyData.success || (verifyData.score && verifyData.score < 0.5)) {
        return NextResponse.json({ error: "Falha na verificação de segurança. Tente novamente." }, { status: 400 })
      }
    }

    if (!nome || !email || !senha || !role) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
    }

    if (senha.length < 8) {
      return NextResponse.json({ error: "A senha deve ter no mínimo 8 caracteres" }, { status: 400 })
    }

    if (!body.aceitouTermos || !body.aceitouLGPD) {
      return NextResponse.json({ error: "Você precisa aceitar os Termos de Uso e a Política de Privacidade" }, { status: 400 })
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

      const dono = await prisma.usuario.create({
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
          aceitouTermos: body.aceitouTermos || false,
          aceitouLGPD: body.aceitouLGPD || false,
          aceitouMarketing: body.aceitouMarketing || false,
          dataAceite: new Date(),
        },
      })

      await prisma.notificacao.create({
        data: {
          usuarioId: dono.id,
          tipo: "boas_vindas",
          titulo: "Academia criada com sucesso!",
          descricao: "Sua academia já está no ar. Comece convidando professores e configurando as graduações.",
          link: "/dashboard/dono",
        },
      })

      await prisma.graduacao.create({
        data: {
          academiaId: novaAcademia.id,
          categoria: "adulto",
          faixa: "Branca",
          graus: 4,
          aulasPorGrau: 20,
          aulasProxFx: 100,
        },
      })

      // If dono was invited by a professor, link the professor to the academy
      if (body.professorId) {
        await prisma.usuario.update({
          where: { id: body.professorId },
          data: { academiaId: novaAcademia.id },
        })
      }

      return NextResponse.json({ redirect: "/dashboard/dono" })
    }

    if (role === "professor") {
      let academiaId = body.academiaId || null

      // Professor sem academia → cria uma automaticamente
      if (!academiaId) {
        const novaAcademia = await prisma.academia.create({
          data: {
            nome: `Academia do ${nome.split(" ")[0]}`,
            endereco: body.endereco || "",
            cidade: body.cidade || "",
            estado: body.estado || "",
            lat: body.lat || 0,
            lng: body.lng || 0,
            raio: body.raio || 200,
            responsavel: nome,
            telefone: telefone || "",
          },
        })
        academiaId = novaAcademia.id

        // Cria graduação padrão
        await prisma.graduacao.create({
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

      const professor = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: hashed,
          telefone: telefone || "",
          role: "professor",
          faixa: body.faixa || "Preta",
          grau: body.grau ?? 3,
          dataNascimento: dataNascimento || null,
          academiaId,
          dataInicio: new Date(),
          aceitouTermos: body.aceitouTermos || false,
          aceitouLGPD: body.aceitouLGPD || false,
          aceitouMarketing: body.aceitouMarketing || false,
          dataAceite: new Date(),
        },
      })

      await prisma.notificacao.create({
        data: {
          usuarioId: professor.id,
          tipo: "boas_vindas",
          titulo: "Bem-vindo, professor!",
          descricao: "Sua conta foi criada. Crie sua primeira turma e comece a gerenciar seus alunos.",
          link: "/dashboard/professor",
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
        faixa: body.faixa || "Branca",
        grau: body.grau ?? 2,
        dataNascimento: dataNascimento || null,
        academiaId: body.academiaId || null,
        professorId: body.professorId || null,
        dataInicio: new Date(),
        aceitouTermos: body.aceitouTermos || false,
        aceitouLGPD: body.aceitouLGPD || false,
        aceitouMarketing: body.aceitouMarketing || false,
        dataAceite: new Date(),
      },
    })

    await prisma.notificacao.create({
      data: {
        usuarioId: usuario.id,
        tipo: "boas_vindas",
        titulo: "Bem-vindo ao OssTrack!",
        descricao: "Sua jornada no Jiu-Jitsu começa aqui. Faça check-in na sua academia e acompanhe sua evolução.",
        link: "/dashboard/aluno",
      },
    })

    return NextResponse.json({ redirect: "/dashboard/aluno" })
  } catch (error: any) {
    console.error("Register error:", error?.message || error)
    const msg = error?.message?.includes("connect") ? "Erro de conexão com o banco de dados" : "Erro interno do servidor"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

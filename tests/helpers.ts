import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import type { Page } from "@playwright/test"
import { URL } from "./constants"

const prisma = new PrismaClient()

const TEST_ACADEMIA = "OssTrack Academia Teste"
const PASSWORD = "123456"

export const TEST_USERS = {
  dono: { email: "carlos@email.com", senha: PASSWORD },
  professor: { email: "leandro@email.com", senha: PASSWORD },
  aluno: { email: "rafael@email.com", senha: PASSWORD },
}

export async function resetRateLimits() {
  await prisma.rateLimitAttempt.deleteMany().catch(() => {})
}

export function preparePage(page: Page) {
  return page.addInitScript(() => {
    try {
      localStorage.setItem("osstrack_pwa_installed", "true")
      localStorage.setItem("oss_tour_done", "true")
      localStorage.setItem("osstrack_tour_aluno", "true")
      localStorage.setItem("osstrack_tour_professor", "true")
      localStorage.setItem("osstrack_tour_dono", "true")
      localStorage.setItem("osstrack_cookie_consent", "true")
      localStorage.setItem("pwa-install-dismissed", "true")
    } catch {}
  })
}

export async function login(page: Page, email: string, password: string, waitUrl = /\/dashboard/) {
  await resetRateLimits()
  await preparePage(page)
  await page.goto(`${URL}/login`)
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(waitUrl, { timeout: 20000 })
  await page.waitForLoadState("networkidle").catch(() => {})
}

export async function seedTestUsers() {
  let academia = await prisma.academia.findFirst({ where: { nome: TEST_ACADEMIA } })
  if (!academia) {
    academia = await prisma.academia.create({
      data: {
        nome: TEST_ACADEMIA,
        endereco: "Rua Teste, 100",
        cidade: "Recife",
        estado: "PE",
        lat: 0,
        lng: 0,
        raio: 200,
        responsavel: "Carlos",
        telefone: "(81) 99999-0000",
      },
    })
  }

  const senha = await bcrypt.hash(PASSWORD, 10)

  const dono = await prisma.usuario.upsert({
    where: { email: TEST_USERS.dono.email },
    update: { academiaId: academia.id, emailVerified: new Date() },
    create: {
      nome: "Carlos Dono",
      email: TEST_USERS.dono.email,
      senha,
      role: "dono",
      faixa: "Preta",
      grau: 3,
      academiaId: academia.id,
      dataInicio: new Date(),
      dataAceite: new Date(),
      aceitouTermos: true,
      aceitouLGPD: true,
      emailVerified: new Date(),
    },
  })

  const professor = await prisma.usuario.upsert({
    where: { email: TEST_USERS.professor.email },
    update: { academiaId: academia.id, emailVerified: new Date() },
    create: {
      nome: "Leandro Professor",
      email: TEST_USERS.professor.email,
      senha,
      role: "professor",
      faixa: "Preta",
      grau: 3,
      academiaId: academia.id,
      dataInicio: new Date(),
      dataAceite: new Date(),
      aceitouTermos: true,
      aceitouLGPD: true,
      emailVerified: new Date(),
    },
  })

  const aluno = await prisma.usuario.upsert({
    where: { email: TEST_USERS.aluno.email },
    update: { academiaId: academia.id, professorId: professor.id, emailVerified: new Date() },
    create: {
      nome: "Rafael Aluno",
      email: TEST_USERS.aluno.email,
      senha,
      role: "aluno",
      faixa: "Branca",
      grau: 2,
      academiaId: academia.id,
      professorId: professor.id,
      dataInicio: new Date(),
      dataAceite: new Date(),
      aceitouTermos: true,
      aceitouLGPD: true,
      emailVerified: new Date(),
    },
  })

  for (const u of [dono, professor, aluno]) {
    await prisma.streak.upsert({
      where: { usuarioId: u.id },
      update: {},
      create: { usuarioId: u.id, currentStreak: 1, bestStreak: 1 },
    })
  }

  const hasPresenca = await prisma.presenca.count({ where: { alunoId: aluno.id } })
  if (hasPresenca === 0) {
    await prisma.presenca.create({
      data: {
        alunoId: aluno.id,
        data: new Date(),
        horario: "19:00-20:00",
        status: "presente",
        turma: "Fundamental",
        origem: "app",
      },
    })
  }

  await prisma.$disconnect()
}

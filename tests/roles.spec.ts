import { test, expect } from "@playwright/test"

const URL = "http://localhost:3000"

interface ErrorLog {
  page: string
  role: string
  errors: string[]
}

const allErrors: ErrorLog[] = []

async function login(page, email: string, password: string) {
  await page.goto(`${URL}/login`)
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/dashboard/, { timeout: 15000 })
}

async function checkPage(page, url: string, role: string, desc: string) {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`)
  })
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`))

  const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 20000 })
  const status = resp?.status() ?? 0
  if (status >= 400) errors.push(`HTTP ${status}`)

  const title = await page.title().catch(() => "")
  allErrors.push({ page: `${desc} (${url})`, role, errors })
}

test("Dono - todas as páginas", async ({ browser }) => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()

  await login(page, "carlos@email.com", "123456")

  const pages = [
    { url: "/dashboard/dono", desc: "Dashboard dono" },
    { url: "/dashboard/dono/alunos", desc: "Alunos" },
    { url: "/dashboard/dono/turmas", desc: "Turmas" },
    { url: "/dashboard/dono/agenda", desc: "Agenda" },
    { url: "/dashboard/dono/financeiro", desc: "Financeiro" },
    { url: "/dashboard/dono/financeiro/cobrancas", desc: "Cobranças" },
    { url: "/dashboard/dono/financeiro/contratos", desc: "Contratos" },
    { url: "/dashboard/dono/financeiro/planos", desc: "Planos" },
    { url: "/dashboard/dono/graduacoes", desc: "Graduações" },
    { url: "/dashboard/dono/relatorios", desc: "Relatórios" },
    { url: "/dashboard/dono/mural", desc: "Mural" },
    { url: "/dashboard/dono/config", desc: "Config" },
    { url: "/dashboard/dono/perfil", desc: "Perfil" },
    { url: "/dashboard/dono/notificacoes", desc: "Notificações" },
    { url: "/dashboard/dono/escanear", desc: "Escanear QR" },
  ]

  for (const p of pages) {
    await checkPage(page, `${URL}${p.url}`, "dono", p.desc)
  }

  await ctx.close()
})

test("Professor - todas as páginas", async ({ browser }) => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()

  await login(page, "leandro@email.com", "123456")

  const pages = [
    { url: "/dashboard/professor", desc: "Dashboard professor" },
    { url: "/dashboard/professor/alunos", desc: "Alunos" },
    { url: "/dashboard/professor/turmas", desc: "Turmas" },
    { url: "/dashboard/professor/agenda", desc: "Agenda" },
    { url: "/dashboard/professor/presencas", desc: "Presenças" },
    { url: "/dashboard/professor/graduacoes", desc: "Graduações" },
    { url: "/dashboard/professor/mural", desc: "Mural" },
    { url: "/dashboard/professor/perfil", desc: "Perfil" },
    { url: "/dashboard/professor/notificacoes", desc: "Notificações" },
    { url: "/dashboard/professor/escanear", desc: "Escanear QR" },
  ]

  for (const p of pages) {
    await checkPage(page, `${URL}${p.url}`, "professor", p.desc)
  }

  await ctx.close()
})

test("Aluno - todas as páginas", async ({ browser }) => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()

  await login(page, "rafael@email.com", "123456")

  const pages = [
    { url: "/dashboard/aluno", desc: "Dashboard aluno" },
    { url: "/dashboard/aluno/treino", desc: "Treino" },
    { url: "/dashboard/aluno/checkin", desc: "Check-in" },
    { url: "/dashboard/aluno/checkin/qr", desc: "QR Scanner" },
    { url: "/dashboard/aluno/mural", desc: "Mural" },
    { url: "/dashboard/aluno/agenda", desc: "Agenda" },
    { url: "/dashboard/aluno/conquistas", desc: "Conquistas" },
    { url: "/dashboard/aluno/ranking", desc: "Ranking" },
    { url: "/dashboard/aluno/evolucao", desc: "Evolução" },
    { url: "/dashboard/aluno/compartilhar", desc: "Compartilhar" },
    { url: "/dashboard/aluno/perfil", desc: "Perfil" },
    { url: "/dashboard/aluno/notificacoes", desc: "Notificações" },
    { url: "/dashboard/aluno/premium", desc: "Premium" },
  ]

  for (const p of pages) {
    await checkPage(page, `${URL}${p.url}`, "aluno", p.desc)
  }

  await ctx.close()
})

test.afterAll(() => {
  console.log("\n========== RELATÓRIO DE ERROS ==========")
  for (const entry of allErrors) {
    if (entry.errors.length > 0) {
      console.log(`\n[${entry.role.toUpperCase()}] ${entry.page}`)
      for (const err of entry.errors) {
        console.log(`  ✗ ${err}`)
      }
    } else {
      console.log(`\n[${entry.role.toUpperCase()}] ${entry.page} ✓ OK`)
    }
  }
  console.log("\n=========================================")

  const totalErros = allErrors.reduce((acc, e) => acc + e.errors.length, 0)
  console.log(`\nTotal de erros encontrados: ${totalErros}`)

  if (totalErros > 0) {
    console.log("\nPáginas com erro:")
    for (const entry of allErrors) {
      if (entry.errors.length > 0) {
        console.log(`  - ${entry.page} (${entry.errors.length} erros)`)
      }
    }
  }
})

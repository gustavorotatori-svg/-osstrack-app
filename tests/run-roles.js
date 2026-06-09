import { chromium } from "playwright"

const URL = "http://localhost:3000"
const results = []

async function login(page, email, password) {
  await page.goto(`${URL}/login`, { waitUntil: "load", timeout: 30000 })
  await page.waitForTimeout(2000)
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/dashboard/, { timeout: 30000 })
  console.log(`  Logged in as ${email}`)
}

async function checkPage(page, url, role, desc) {
  const errors = []
  const onConsole = (msg) => {
    if (msg.type() === "error") errors.push(`console.error: ${msg.text().slice(0, 200)}`)
  }
  const onPageError = (err) => errors.push(`pageerror: ${err.message.slice(0, 200)}`)
  page.on("console", onConsole)
  page.on("pageerror", onPageError)

  try {
    console.log(`  ${url}`)
    const resp = await page.goto(url, { waitUntil: "load", timeout: 30000 })
    await page.waitForTimeout(2000)
    if (resp && resp.status() >= 400) errors.push(`HTTP ${resp.status()}`)
  } catch (e) {
    errors.push(`navigation error: ${e.message.slice(0, 200)}`)
  }

  page.removeListener("console", onConsole)
  page.removeListener("pageerror", onPageError)
  results.push({ page: `${desc} (${url})`, role, errors })
}

async function main() {
  console.log("Launching Chrome...")
  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
  })
  const ctx = await browser.newContext()
  const page = await ctx.newPage()

  // DONO
  console.log("\n--- DONO (carlos@email.com) ---")
  await login(page, "carlos@email.com", "123456")

  const donoPages = [
    { url: "/dashboard/dono", desc: "Dashboard" },
    { url: "/dashboard/dono/alunos", desc: "Alunos" },
    { url: "/dashboard/dono/turmas", desc: "Turmas" },
    { url: "/dashboard/dono/agenda", desc: "Agenda" },
    { url: "/dashboard/dono/financeiro", desc: "Financeiro" },
    { url: "/dashboard/dono/financeiro/cobrancas", desc: "Cobrancas" },
    { url: "/dashboard/dono/financeiro/contratos", desc: "Contratos" },
    { url: "/dashboard/dono/financeiro/planos", desc: "Planos" },
    { url: "/dashboard/dono/graduacoes", desc: "Graduacoes" },
    { url: "/dashboard/dono/relatorios", desc: "Relatorios" },
    { url: "/dashboard/dono/mural", desc: "Mural" },
    { url: "/dashboard/dono/config", desc: "Config" },
    { url: "/dashboard/dono/perfil", desc: "Perfil" },
    { url: "/dashboard/dono/notificacoes", desc: "Notificacoes" },
    { url: "/dashboard/dono/escanear", desc: "Escanear" },
  ]
  for (const p of donoPages) {
    await checkPage(page, `${URL}${p.url}`, "dono", p.desc)
  }

  // PROFESSOR
  console.log("\n--- PROFESSOR (leandro@email.com) ---")
  await page.goto(`${URL}/login`, { waitUntil: "load" })
  await login(page, "leandro@email.com", "123456")

  const profPages = [
    { url: "/dashboard/professor", desc: "Dashboard" },
    { url: "/dashboard/professor/alunos", desc: "Alunos" },
    { url: "/dashboard/professor/turmas", desc: "Turmas" },
    { url: "/dashboard/professor/agenda", desc: "Agenda" },
    { url: "/dashboard/professor/presencas", desc: "Presencas" },
    { url: "/dashboard/professor/graduacoes", desc: "Graduacoes" },
    { url: "/dashboard/professor/mural", desc: "Mural" },
    { url: "/dashboard/professor/perfil", desc: "Perfil" },
    { url: "/dashboard/professor/notificacoes", desc: "Notificacoes" },
    { url: "/dashboard/professor/escanear", desc: "Escanear" },
  ]
  for (const p of profPages) {
    await checkPage(page, `${URL}${p.url}`, "professor", p.desc)
  }

  await ctx.close()
  await browser.close()

  // REPORT
  console.log("\n" + "=".repeat(60))
  console.log("RELATORIO DE TESTES - DONO E PROFESSOR")
  console.log("=".repeat(60))

  const totalComErro = results.filter((r) => r.errors.length > 0)
  const totalOk = results.filter((r) => r.errors.length === 0)

  console.log(`\nOK: ${totalOk.length}`)
  console.log(`COM ERRO: ${totalComErro.length}`)
  console.log(`Total paginas visitadas: ${results.length}`)

  if (totalComErro.length > 0) {
    console.log("\n" + "-".repeat(60))
    console.log("DETALHAMENTO DOS ERROS")
    console.log("-".repeat(60))
    for (const entry of totalComErro) {
      console.log(`\n[${entry.role.toUpperCase()}] ${entry.page}`)
      for (const err of entry.errors) {
        console.log(`  X ${err}`)
      }
    }
  }

  const totalErros = totalComErro.reduce((acc, e) => acc + e.errors.length, 0)
  console.log(`\n${"-".repeat(60)}`)
  console.log(`Total de erros encontrados: ${totalErros}`)
  console.log("=".repeat(60))
}

main().catch(console.error)

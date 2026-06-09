import { chromium } from "playwright"

const URL = "http://localhost:3000"
const results: { role: string; page: string; errors: string[] }[] = []

async function login(page, email: string, password: string) {
  await page.goto(`${URL}/login`, { waitUntil: "networkidle" })
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/dashboard/, { timeout: 15000 })
}

async function checkPage(page, url: string, role: string, desc: string) {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console.error: ${msg.text().slice(0, 200)}`)
  })
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message.slice(0, 200)}`))

  try {
    const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 20000 })
    if (resp && resp.status() >= 400) errors.push(`HTTP ${resp.status()}`)
  } catch (e) {
    errors.push(`navigation error: ${e.message.slice(0, 200)}`)
  }

  await page.waitForTimeout(1000)
  results.push({ page: `${desc} (${url})`, role, errors })
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext()

  // DONO
  const donoPage = await ctx.newPage()
  await login(donoPage, "carlos@email.com", "123456")
  const donoPages = [
    { url: "/dashboard/dono", desc: "Dashboard" },
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
    { url: "/dashboard/dono/escanear", desc: "Escanear" },
  ]
  for (const p of donoPages) {
    await checkPage(donoPage, `${URL}${p.url}`, "dono", p.desc)
  }

  // PROFESSOR
  await donoPage.goto(`${URL}/login`, { waitUntil: "networkidle" })
  await login(donoPage, "leandro@email.com", "123456")
  const profPages = [
    { url: "/dashboard/professor", desc: "Dashboard" },
    { url: "/dashboard/professor/alunos", desc: "Alunos" },
    { url: "/dashboard/professor/turmas", desc: "Turmas" },
    { url: "/dashboard/professor/agenda", desc: "Agenda" },
    { url: "/dashboard/professor/presencas", desc: "Presenças" },
    { url: "/dashboard/professor/graduacoes", desc: "Graduações" },
    { url: "/dashboard/professor/mural", desc: "Mural" },
    { url: "/dashboard/professor/perfil", desc: "Perfil" },
    { url: "/dashboard/professor/notificacoes", desc: "Notificações" },
    { url: "/dashboard/professor/escanear", desc: "Escanear" },
  ]
  for (const p of profPages) {
    await checkPage(donoPage, `${URL}${p.url}`, "professor", p.desc)
  }

  await ctx.close()
  await browser.close()

  // REPORT
  console.log("")
  console.log("=".repeat(60))
  console.log("RELATÓRIO DE TESTES - DONO E PROFESSOR")
  console.log("=".repeat(60))

  const totalComErro = results.filter((r) => r.errors.length > 0)
  const totalOk = results.filter((r) => r.errors.length === 0)

  console.log(`\n✅ Páginas OK: ${totalOk.length}`)
  console.log(`❌ Páginas com erro: ${totalComErro.length}`)
  console.log(`📄 Total de páginas visitadas: ${results.length}`)

  if (totalComErro.length > 0) {
    console.log("\n" + "─".repeat(60))
    console.log("DETALHAMENTO DOS ERROS")
    console.log("─".repeat(60))
    for (const entry of totalComErro) {
      console.log(`\n[${entry.role.toUpperCase()}] ${entry.page}`)
      for (const err of entry.errors) {
        console.log(`  ✗ ${err}`)
      }
    }
  }

  const totalErros = totalComErro.reduce((acc, e) => acc + e.errors.length, 0)
  console.log(`\n${"─".repeat(60)}`)
  console.log(`Total de erros encontrados: ${totalErros}`)
  console.log("=".repeat(60))
}

main().catch(console.error)

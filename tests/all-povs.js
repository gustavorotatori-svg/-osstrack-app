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

async function testFeature(page, role, desc, fn) {
  const errors = []
  const onConsole = (msg) => {
    if (msg.type() === "error") errors.push(`console.error: ${msg.text().slice(0, 200)}`)
  }
  const onPageError = (err) => errors.push(`pageerror: ${err.message.slice(0, 200)}`)
  page.on("console", onConsole)
  page.on("pageerror", onPageError)

  try {
    await fn(page)
  } catch (e) {
    errors.push(`feature error: ${e.message.slice(0, 200)}`)
  }

  page.removeListener("console", onConsole)
  page.removeListener("pageerror", onPageError)
  results.push({ page: desc, role, errors })
}

async function main() {
  const browser = await chromium.launch({ headless: true, channel: "chrome" })

  // ========== 1. ANONYMOUS ==========
  console.log("\n--- ANONYMOUS ---")
  const anonCtx = await browser.newContext()
  const anonPage = await anonCtx.newPage()

  await checkPage(anonPage, `${URL}/`, "anonymous", "Home / Landing page")
  await checkPage(anonPage, `${URL}/login`, "anonymous", "Login page")
  await checkPage(anonPage, `${URL}/cadastro`, "anonymous", "Cadastro page")
  await checkPage(anonPage, `${URL}/ajuda`, "anonymous", "Ajuda page")
  await checkPage(anonPage, `${URL}/lgpd`, "anonymous", "LGPD page")
  await checkPage(anonPage, `${URL}/dashboard`, "anonymous", "Dashboard redirect (nao autenticado)")

  await anonCtx.close()

  // ========== 2. ALUNO ==========
  console.log("\n--- ALUNO ---")
  const alunoCtx = await browser.newContext()
  const alunoPage = await alunoCtx.newPage()
  await login(alunoPage, "rafael@email.com", "123456")

  const alunoPages = [
    { url: "/dashboard/aluno", desc: "Dashboard" },
    { url: "/dashboard/aluno/treino", desc: "Treino" },
    { url: "/dashboard/aluno/agenda", desc: "Agenda" },
    { url: "/dashboard/aluno/checkin", desc: "Check-in" },
    { url: "/dashboard/aluno/checkin/qr", desc: "Check-in QR" },
    { url: "/dashboard/aluno/evolucao", desc: "Evolucao" },
    { url: "/dashboard/aluno/conquistas", desc: "Conquistas" },
    { url: "/dashboard/aluno/ranking", desc: "Ranking" },
    { url: "/dashboard/aluno/mural", desc: "Mural" },
    { url: "/dashboard/aluno/perfil", desc: "Perfil" },
    { url: "/dashboard/aluno/compartilhar", desc: "Compartilhar" },
    { url: "/dashboard/aluno/notificacoes", desc: "Notificacoes" },
  ]
  for (const p of alunoPages) {
    await checkPage(alunoPage, `${URL}${p.url}`, "aluno", p.desc)
  }

  // Test feature: check-in
  await testFeature(alunoPage, "aluno", "Feature: Fazer check-in", async (page) => {
    await page.goto(`${URL}/dashboard/aluno/checkin`, { waitUntil: "load" })
    await page.waitForTimeout(2000)
    const btn = page.locator('button:has-text("Check-in"), button:has-text("check-in"), button:has-text("Entrar")').first()
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click()
      await page.waitForTimeout(3000)
    }
  })

  await alunoCtx.close()

  // ========== 3. PROFESSOR ==========
  console.log("\n--- PROFESSOR ---")
  const profCtx = await browser.newContext()
  const profPage = await profCtx.newPage()
  await login(profPage, "leandro@email.com", "123456")

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
    await checkPage(profPage, `${URL}${p.url}`, "professor", p.desc)
  }

  await profCtx.close()

  // ========== 4. DONO ==========
  console.log("\n--- DONO ---")
  const donoCtx = await browser.newContext()
  const donoPage = await donoCtx.newPage()
  await login(donoPage, "carlos@email.com", "123456")

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
    await checkPage(donoPage, `${URL}${p.url}`, "dono", p.desc)
  }

  // Test feature: criar turma
  await testFeature(donoPage, "dono", "Feature: Criar turma", async (page) => {
    await page.goto(`${URL}/dashboard/dono/turmas`, { waitUntil: "load" })
    await page.waitForTimeout(2000)
    const btn = page.locator('a:has-text("Criar"), button:has-text("Criar"), a:has-text("Nova"), button:has-text("Nova")').first()
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click()
      await page.waitForTimeout(2000)
    }
  })

  await donoCtx.close()

  await browser.close()

  // ========== REPORT ==========
  console.log("\n" + "=".repeat(70))
  console.log("RELATORIO FINAL DE TESTES - TODOS OS POVS")
  console.log("=".repeat(70))

  const byRole = {}
  for (const r of results) {
    if (!byRole[r.role]) byRole[r.role] = []
    byRole[r.role].push(r)
  }

  for (const [role, entries] of Object.entries(byRole)) {
    const comErro = entries.filter((e) => e.errors.length > 0)
    const semErro = entries.filter((e) => e.errors.length === 0)
    console.log(`\n[${role.toUpperCase()}] ${semErro.length} OK / ${comErro.length} COM ERRO`)
    for (const e of entries) {
      if (e.errors.length === 0) {
        console.log(`  \u2713 ${e.page}`)
      } else {
        console.log(`  \u2717 ${e.page}`)
        for (const err of e.errors) {
          console.log(`    X ${err}`)
        }
      }
    }
  }

  const totalComErro = results.filter((r) => r.errors.length > 0)
  const totalOk = results.filter((r) => r.errors.length === 0)
  const totalErros = totalComErro.reduce((acc, e) => acc + e.errors.length, 0)

  console.log(`\n${"=".repeat(70)}`)
  console.log(`OK: ${totalOk.length} | COM ERRO: ${totalComErro.length} | TOTAL ERROS: ${totalErros}`)
  console.log("=".repeat(70))
}

main().catch(console.error)

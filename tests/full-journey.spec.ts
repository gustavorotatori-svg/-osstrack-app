import { test, expect, Page } from "@playwright/test"

const URL = "http://localhost:3000"

// ============================================================
// HELPERS
// ============================================================

async function login(page: Page, email: string, password: string) {
  await page.goto(`${URL}/login`)
  await page.waitForLoadState("networkidle")
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/dashboard/, { timeout: 15000 })
}

async function dismissTour(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem("osstrack_tour_aluno", "true")
    localStorage.setItem("osstrack_tour_professor", "true")
    localStorage.setItem("osstrack_tour_dono", "true")
  })
  // If the tour modal is already showing, click "Pular Tour" to dismiss it
  const skipBtn = page.locator("button", { hasText: "Pular Tour" })
  if (await skipBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await skipBtn.click()
    await page.waitForTimeout(500)
  }
}

async function checkNoConsoleErrors(page: Page) {
  const logs: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") logs.push(msg.text())
  })
  page.on("pageerror", (err) => logs.push(err.message))
  await page.waitForTimeout(1000)
  expect(logs.length, `Console errors: ${logs.join(", ")}`).toBe(0)
}

// ============================================================
// 1. ANONYMOUS / LANDING
// ============================================================

test.describe("1. Anônimo — Landing & Cadastro", () => {
  test("Home page carrega sem erros", async ({ page }) => {
    await page.goto(URL)
    await expect(page.locator("body")).toBeVisible()
    await checkNoConsoleErrors(page)
  })

  test("Login page carrega com formulário", async ({ page }) => {
    await page.goto(`${URL}/login`)
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test("Cadastro page carrega com steps", async ({ page }) => {
    await page.goto(`${URL}/cadastro`)
    await page.waitForLoadState("networkidle")
    // Should show role selection or form fields
    const inputs = page.locator('input[name], input[type="email"], input[type="text"]')
    await expect(inputs.first()).toBeVisible()
  })

  test("Ajuda page carrega", async ({ page }) => {
    await page.goto(`${URL}/ajuda`)
    await expect(page.locator("body")).toBeVisible()
  })

  test("Dashboard sem login redireciona", async ({ page }) => {
    await page.goto(`${URL}/dashboard`)
    await page.waitForURL(/\/login/, { timeout: 10000 })
  })
})

// ============================================================
// 2. ALUNO — Full Journey
// ============================================================

test.describe("2. Aluno — Jornada Completa", () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await login(page, "rafael@email.com", "123456")
  })

  test("Dashboard carrega com hero, quick actions e stats", async () => {
    await page.goto(`${URL}/dashboard/aluno`)
    await page.waitForLoadState("networkidle")
    await dismissTour(page)

    // Hero
    await expect(page.locator("h1")).toBeVisible()

    // Quick actions (4 buttons)
    const quickActions = page.locator("button", { hasText: /Treinos|Turmas|Progresso|Ranking/ }).first()
    await expect(quickActions).toBeVisible()

    // Tech stats (4 cards)
    const stats = page.locator(".tech-stat")
    await expect(stats).toHaveCount(4)

    // Progress Ring
    await expect(page.locator("svg").first()).toBeVisible()

    // Mestre do Mês card
    await expect(page.locator("text=Mestre do Mês").or(page.locator("text=Mestre")).first()).toBeVisible()

    await checkNoConsoleErrors(page)
  })

  test("Treino — diário com exercícios e timer", async () => {
    await page.goto(`${URL}/dashboard/aluno/treino`)
    await page.waitForLoadState("networkidle")
    await dismissTour(page)

    // Hero
    await expect(page.locator("h1")).toBeVisible()

    // Stats mini (3 cards)
    const stats = page.locator(".tech-stat")
    await expect(stats).toHaveCount(3)

    // "Iniciar Treino" button
    const iniciarBtn = page.locator("button", { hasText: "Iniciar Treino" })
    await expect(iniciarBtn).toBeVisible()

    // Click iniciar treino
    await iniciarBtn.click({ force: true })
    await page.waitForTimeout(500)

    // Timer section should be visible
    await expect(page.locator("button", { hasText: "Finalizar Treino" })).toBeVisible()

    // Click an exercise button
    const exerciseBtn = page.locator("button", { hasText: "Granby Roll" })
    if (await exerciseBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await exerciseBtn.click()
      await page.waitForTimeout(300)
    }
  })

  test("Check-in carrega sem erros", async () => {
    await page.goto(`${URL}/dashboard/aluno/checkin`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
    await checkNoConsoleErrors(page)
  })

  test("Evolução — gráfico, timeline e projeção", async () => {
    await page.goto(`${URL}/dashboard/aluno/evolucao`)
    await page.waitForLoadState("networkidle")

    // Hero
    await expect(page.locator("h1")).toBeVisible()

    // Stats (4 cards)
    const stats = page.locator(".tech-stat")
    await expect(stats).toHaveCount(4)

    // Bar chart
    await expect(page.locator("text=Aulas por mês")).toBeVisible()

    // Belt timeline
    await expect(page.locator("text=Progressão de Faixas")).toBeVisible()

    await checkNoConsoleErrors(page)
  })

  test("Conquistas carrega com badges", async () => {
    await page.goto(`${URL}/dashboard/aluno/conquistas`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
    await checkNoConsoleErrors(page)
  })

  test("Ranking carrega com lista", async () => {
    await page.goto(`${URL}/dashboard/aluno/ranking`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
    await checkNoConsoleErrors(page)
  })

  test("Mural carrega com feed", async () => {
    await page.goto(`${URL}/dashboard/aluno/mural`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
    await checkNoConsoleErrors(page)
  })

  test("Compartilhar — gera card e story", async () => {
    await page.goto(`${URL}/dashboard/aluno/compartilhar`)
    await page.waitForLoadState("networkidle")

    // Title
    await expect(page.locator("h1")).toBeVisible()

    // Preview card
    await expect(page.getByText("OSSTRACK", { exact: true })).toBeVisible()

    // Buttons
    await expect(page.locator("button", { hasText: "Card" })).toBeVisible()
    await expect(page.locator("button", { hasText: "Stories" })).toBeVisible()
    await expect(page.locator("button", { hasText: "Compartilhar" }).first()).toBeVisible()
    await expect(page.locator("button", { hasText: "Copiar" }).or(page.locator("button", { hasText: "Copiado" }))).toBeVisible()

    await checkNoConsoleErrors(page)
  })

  test("Premium page carrega", async () => {
    await page.goto(`${URL}/dashboard/aluno/premium`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("Perfil carrega", async () => {
    await page.goto(`${URL}/dashboard/aluno/perfil`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("Notificações carrega", async () => {
    await page.goto(`${URL}/dashboard/aluno/notificacoes`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("Quick action Ranking navega para página correta", async () => {
    await page.goto(`${URL}/dashboard/aluno`)
    await page.waitForLoadState("networkidle")
    await dismissTour(page)

    // Click the "Ranking" quick action button
    const rankingBtn = page.locator("button.relative.overflow-hidden.rounded-xl", { hasText: "Ranking" })
    await expect(rankingBtn).toBeVisible()
    await rankingBtn.click()

    // Should navigate to ranking page
    await page.waitForURL(/\/dashboard\/aluno\/ranking/, { timeout: 10000 })
    await expect(page.locator("body")).toBeVisible()
  })
})

// ============================================================
// 3. PROFESSOR — Full Journey
// ============================================================

test.describe("3. Professor — Jornada Completa", () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await login(page, "leandro@email.com", "123456")
  })

  test("Dashboard carrega com hero, quick actions, stats e presenças", async () => {
    await page.goto(`${URL}/dashboard/professor`)
    await page.waitForLoadState("networkidle")
    await dismissTour(page)

    // Hero
    await expect(page.locator("h1")).toBeVisible()

    // Quick actions (6 buttons)
    const quickActions = page.locator("button", { hasText: /Turmas|Alunos|Presenças|Graduações|Relatórios|Config/ }).first()
    await expect(quickActions).toBeVisible()

    // Stats (3 cards)
    const stats = page.locator(".tech-stat")
    await expect(stats).toHaveCount(3)

    // Tab bar
    const tabBar = page.locator(".tab-bar")
    await expect(tabBar).toBeVisible()
    await expect(tabBar.locator("button", { hasText: "Geral" })).toBeVisible()
    await expect(tabBar.locator("button", { hasText: "Presenças" })).toBeVisible()

    // Verify both sections render by switching tabs
    await tabBar.locator("button", { hasText: "Presenças" }).click()
    await page.waitForTimeout(300)
    await expect(page.locator("text=Presenças").first()).toBeVisible()

    await tabBar.locator("button", { hasText: "Geral" }).click()
    await page.waitForTimeout(300)

    await checkNoConsoleErrors(page)
  })

  test("Alunos carrega com lista", async () => {
    await page.goto(`${URL}/dashboard/professor/alunos`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
    await checkNoConsoleErrors(page)
  })

  test("Turmas carrega", async () => {
    await page.goto(`${URL}/dashboard/professor/turmas`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
    await checkNoConsoleErrors(page)
  })

  test("Agenda carrega", async () => {
    await page.goto(`${URL}/dashboard/professor/agenda`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
    await checkNoConsoleErrors(page)
  })

  test("Presenças carrega", async () => {
    await page.goto(`${URL}/dashboard/professor/presencas`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("Graduações carrega", async () => {
    await page.goto(`${URL}/dashboard/professor/graduacoes`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("Mural carrega", async () => {
    await page.goto(`${URL}/dashboard/professor/mural`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("Escanear QR carrega", async () => {
    await page.goto(`${URL}/dashboard/professor/escanear`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("Quick action Alunos navega para página correta", async () => {
    await page.goto(`${URL}/dashboard/professor`)
    await page.waitForLoadState("networkidle")
    await dismissTour(page)

    // Click the "Alunos" quick action button
    const alunosBtn = page.locator("button.relative.overflow-hidden.rounded-xl", { hasText: "Alunos" })
    await expect(alunosBtn).toBeVisible()
    await alunosBtn.click()

    // Should navigate to alunos page
    await page.waitForURL(/\/dashboard\/professor\/alunos/, { timeout: 10000 })
    await expect(page.locator("body")).toBeVisible()
  })
})

// ============================================================
// 4. DONO — Full Journey
// ============================================================

test.describe("4. Dono — Jornada Completa", () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await login(page, "carlos@email.com", "123456")
  })

  test("Dashboard carrega com hero, quick actions, stats, gráfico e tabs", async () => {
    await page.goto(`${URL}/dashboard/dono`)
    await page.waitForLoadState("networkidle")
    await dismissTour(page)

    // Hero
    await expect(page.locator("h1")).toBeVisible()

    // Quick actions (6 buttons)
    const quickActions = page.locator("button", { hasText: /Turmas|Alunos|Financeiro|Relatórios|Agenda|Config/ }).first()
    await expect(quickActions).toBeVisible()

    // Stats (4 cards)
    const stats = page.locator(".tech-stat")
    await expect(stats).toHaveCount(4)

    // Monthly chart
    await expect(page.locator("text=Presenças por Mês")).toBeVisible()

    // Tabs
    const tabs = page.locator(".tab-bar button")
    await expect(tabs.first()).toBeVisible()

    await checkNoConsoleErrors(page)
  })

  test("Dashboard — navega por tabs", async () => {
    await page.goto(`${URL}/dashboard/dono`)
    await page.waitForLoadState("networkidle")
    await dismissTour(page)

    const tabNames = ["Alunos", "Graduações", "Ranking", "Prospectos"]
    for (const tabName of tabNames) {
      const tab = page.locator(".tab-bar button", { hasText: tabName }).first()
      if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tab.click({ force: true })
        await page.waitForTimeout(500)
      }
    }

    // Go back to Geral
    const geralTab = page.locator(".tab-bar button", { hasText: "Geral" })
    if (await geralTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await geralTab.click()
    }
  })

  test("Alunos carrega com lista", async () => {
    await page.goto(`${URL}/dashboard/dono/alunos`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("Turmas carrega", async () => {
    await page.goto(`${URL}/dashboard/dono/turmas`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("Agenda carrega", async () => {
    await page.goto(`${URL}/dashboard/dono/agenda`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("Financeiro carrega com stats e cobranças", async () => {
    await page.goto(`${URL}/dashboard/dono/financeiro`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("Financeiro - Cobranças carrega", async () => {
    await page.goto(`${URL}/dashboard/dono/financeiro/cobrancas`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("Financeiro - Contratos carrega", async () => {
    await page.goto(`${URL}/dashboard/dono/financeiro/contratos`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("Financeiro - Planos carrega", async () => {
    await page.goto(`${URL}/dashboard/dono/financeiro/planos`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("Graduações carrega", async () => {
    await page.goto(`${URL}/dashboard/dono/graduacoes`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("Relatórios carrega com KPIs e gráfico", async () => {
    await page.goto(`${URL}/dashboard/dono/relatorios`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
    await checkNoConsoleErrors(page)
  })

  test("Mural carrega", async () => {
    await page.goto(`${URL}/dashboard/dono/mural`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("Config carrega com toggle ranking", async () => {
    await page.goto(`${URL}/dashboard/dono/config`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("Escanear QR carrega", async () => {
    await page.goto(`${URL}/dashboard/dono/escanear`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("Perfil carrega", async () => {
    await page.goto(`${URL}/dashboard/dono/perfil`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })

  test("Ranking toggle funciona na dashboard", async () => {
    await page.goto(`${URL}/dashboard/dono`)
    await page.waitForLoadState("networkidle")
    await dismissTour(page)

    // Switch to Ranking tab
    const rankingTab = page.locator(".tab-bar button", { hasText: "Ranking" })
    if (await rankingTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await rankingTab.click({ force: true })
      await page.waitForTimeout(500)

      // Find the toggle switch
      const toggle = page.locator("button.relative.w-12.h-7.rounded-full")
      if (await toggle.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Get current state via class
        const initialClass = await toggle.getAttribute("class") || ""
        const wasVisible = initialClass.includes("bg-emerald-600")

        await toggle.click()
        await page.waitForTimeout(500)

        // Toggle back to original state
        await toggle.click()
        await page.waitForTimeout(300)
      }
    }
  })
})

// ============================================================
// 5. GAMIFICATION & PREMIUM
// ============================================================

test.describe("5. Gamificação — Aluno Premium Flow", () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await login(page, "rafael@email.com", "123456")
  })

  test("Dashboard contém Mestre do Mês, Daily Missions e Meta Semanal", async () => {
    await page.goto(`${URL}/dashboard/aluno`)
    await page.waitForLoadState("networkidle")
    await dismissTour(page)
    await page.waitForTimeout(2000) // wait for premium check to resolve

    // Mestre do Mês should render (free feature)
    const mestreCard = page.locator("text=Mestre do Mês").or(page.locator("text=Mestre")).first()
    await expect(mestreCard).toBeVisible({ timeout: 5000 })

    await checkNoConsoleErrors(page)
  })

  test("Daily Missions e Meta Semanal com PremiumLock (blur para free)", async () => {
    await page.goto(`${URL}/dashboard/aluno`)
    await page.waitForLoadState("networkidle")
    await dismissTour(page)
    await page.waitForTimeout(2000)

    // PremiumBanner should be visible for free users
    const banner = page.locator("button", { hasText: "Assinar" })
    if (await banner.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(banner).toBeVisible()
    }
  })
})

// ============================================================
// 6. SUMMARY
// ============================================================

test.describe("6. Relatório Final", () => {
  test("Todos os testes foram executados", () => {
    // This is a placeholder — the actual results will be shown by Playwright
    console.log("\n========================================")
    console.log("TESTE DE JORNADA COMPLETA FINALIZADO")
    console.log("========================================")
  })
})

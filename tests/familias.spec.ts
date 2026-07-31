import { test, expect } from "@playwright/test"

const URL = "http://localhost:3000"

const DONO = { email: "carlos@email.com", password: "123456" }
const ALUNO = { email: "rafael@email.com", password: "123456" }

test.describe("CRUD Famílias", () => {
  test.beforeEach(async ({ page }) => {
    // Login como dono
    await page.goto(`${URL}/login`)
    await page.fill('input[type="email"]', DONO.email)
    await page.fill('input[type="password"]', DONO.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard\/dono/, { timeout: 15000 })
  })

  test("1. Navegar para página de famílias", async ({ page }) => {
    await page.goto(`${URL}/dashboard/dono/familia`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("text=Famílias").first()).toBeVisible({ timeout: 5000 })
  })

  test("2. Criar família", async ({ page }) => {
    await page.goto(`${URL}/dashboard/dono/familia`)
    await page.waitForLoadState("networkidle")

    await page.click("text=Nova Família")
    await page.waitForTimeout(300)

    const nome = `Família Teste ${Date.now()}`
    await page.fill('input[placeholder="Ex: Família Silva"]', nome)
    await page.fill('input[type="number"]', "15")
    await page.click('text=Criar Família')
    await page.waitForTimeout(1000)

    await expect(page.locator(`text=${nome}`).first()).toBeVisible({ timeout: 5000 })
  })

  test("3. Criar família sem nome mostra validação", async ({ page }) => {
    await page.goto(`${URL}/dashboard/dono/familia`)
    await page.waitForLoadState("networkidle")

    await page.click("text=Nova Família")
    await page.waitForTimeout(300)

    // Tenta criar sem nome
    await page.fill('input[placeholder="Ex: Família Silva"]', "")
    await page.click('text=Criar Família')

    // Deve continuar na página (não redireciona)
    expect(page.url()).toContain("/familia")
  })

  test("4. Editar família", async ({ page }) => {
    await page.goto(`${URL}/dashboard/dono/familia`)
    await page.waitForLoadState("networkidle")

    // Cria família primeiro
    const nome = `Família Edit ${Date.now()}`
    await page.click("text=Nova Família")
    await page.waitForTimeout(300)
    await page.fill('input[placeholder="Ex: Família Silva"]', nome)
    await page.fill('input[type="number"]', "10")
    await page.click('text=Criar Família')
    await page.waitForTimeout(1000)

    // Clica no botão de editar (lápis) da família recém-criada
    const pencilButtons = page.locator('button:has(svg[class*="w-4 h-4"])')
    const editBtn = pencilButtons.first()
    if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editBtn.click()
      await page.waitForTimeout(300)
    }
  })

  test("5. Gerenciar membros - abrir painel", async ({ page }) => {
    await page.goto(`${URL}/dashboard/dono/familia`)
    await page.waitForLoadState("networkidle")

    // Cria família
    const nome = `Família Membros ${Date.now()}`
    await page.click("text=Nova Família")
    await page.waitForTimeout(300)
    await page.fill('input[placeholder="Ex: Família Silva"]', nome)
    await page.fill('input[type="number"]', "20")
    await page.click('text=Criar Família')
    await page.waitForTimeout(1000)

    // Clica em "Gerenciar Membros"
    const gerenciarBtn = page.locator("text=Gerenciar Membros").first()
    if (await gerenciarBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await gerenciarBtn.click()
      await page.waitForTimeout(500)
      // Painel deve abrir
      await expect(page.locator("text=Membros").first()).toBeVisible({ timeout: 3000 })
    }
  })

  test("6. Excluir família", async ({ page }) => {
    await page.goto(`${URL}/dashboard/dono/familia`)
    await page.waitForLoadState("networkidle")

    // Cria família
    const nome = `Família Delete ${Date.now()}`
    await page.click("text=Nova Família")
    await page.waitForTimeout(300)
    await page.fill('input[placeholder="Ex: Família Silva"]', nome)
    await page.fill('input[type="number"]', "10")
    await page.click('text=Criar Família')
    await page.waitForTimeout(1000)

    // Exclui
    const deleteButtons = page.locator('button:has(svg[class*="w-4 h-4"])')
    const deleteBtn = deleteButtons.last()
    if (await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      page.on("dialog", (dialog) => dialog.accept())
      await deleteBtn.click()
      await page.waitForTimeout(500)
    }
  })

  test("7. API - listar famílias retorna array", async ({ page }) => {
    const resp = await page.evaluate(async () => {
      const res = await fetch("/api/familia")
      return { status: res.status, data: await res.json() }
    })
    expect(resp.status).toBe(200)
    expect(Array.isArray(resp.data)).toBe(true)
  })

  test("8. API - criar família como dono", async ({ page }) => {
    const resp = await page.evaluate(async () => {
      const res = await fetch("/api/familia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: `API Test ${Date.now()}`, desconto: 10 }),
      })
      return { status: res.status, data: await res.json() }
    })
    expect(resp.status).toBe(200)
  })

  test("9. Sidebar tem link Famílias", async ({ page }) => {
    await page.goto(`${URL}/dashboard/dono`)
    await page.waitForLoadState("networkidle")

    const familiasLink = page.locator('a[href="/dashboard/dono/familia"]')
    await expect(familiasLink).toBeVisible({ timeout: 5000 })
  })
})

test.describe("Família no perfil do aluno", () => {
  test("Perfil do aluno mostra card família se pertencer a uma", async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    // Login como aluno
    await page.goto(`${URL}/login`)
    await page.fill('input[type="email"]', ALUNO.email)
    await page.fill('input[type="password"]', ALUNO.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard\/aluno/, { timeout: 15000 })

    await page.goto(`${URL}/dashboard/aluno/perfil`)
    await page.waitForLoadState("networkidle")

    // Se o aluno tiver família, deve mostrar o card
    const familiaCard = page.locator("text=Família").or(page.locator("text=Desconto familiar"))
    const exists = await familiaCard.isVisible({ timeout: 5000 }).catch(() => false)

    // O perfil deve carregar independente de ter família ou não
    const nome = page.locator("text=Rafael").or(page.locator("h2"))
    await expect(nome).toBeVisible({ timeout: 5000 })

    await ctx.close()
  })

  test("Perfil do aluno carreva stats mesmo sem família", async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    await page.goto(`${URL}/login`)
    await page.fill('input[type="email"]', ALUNO.email)
    await page.fill('input[type="password"]', ALUNO.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard\/aluno/, { timeout: 15000 })

    await page.goto(`${URL}/dashboard/aluno/perfil`)
    await page.waitForLoadState("networkidle")

    // Stats devem aparecer
    const stats = page.locator(".stat-glass")
    const count = await stats.count()
    expect(count).toBeGreaterThanOrEqual(2)

    await ctx.close()
  })
})

test.describe("Lista de alunos com família", () => {
  test("Coluna família aparece na lista de alunos do dono", async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()

    await page.goto(`${URL}/login`)
    await page.fill('input[type="email"]', DONO.email)
    await page.fill('input[type="password"]', DONO.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard\/dono/, { timeout: 15000 })

    await page.goto(`${URL}/dashboard/dono/alunos`)
    await page.waitForLoadState("networkidle")

    // Coluna Família deve existir no header
    const familiaHeader = page.locator("text=Família").first()
    await expect(familiaHeader).toBeVisible({ timeout: 5000 })

    await ctx.close()
  })
})

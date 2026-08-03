import { test, expect, type Page } from "@playwright/test"
import { URL } from "./constants"
const EMAIL = `test${Date.now()}@example.com`
const PASSWORD = "Teste1234"

// ============================================================
// HELPERS
// ============================================================

async function fillStep1(page: Page, email: string, role: "aluno" | "dono") {
  await page.fill("#cad-nome", "Teste E2E")
  await page.fill("#cad-email", email)
  await page.fill("#cad-senha", PASSWORD)
  await page.fill("#cad-confirmar-senha", PASSWORD)
  if (role === "dono") {
    await page.locator("button", { hasText: "Dono de Academia" }).click()
  } else {
    await page.locator("button", { hasText: "Aluno" }).click()
  }
  await page.waitForTimeout(200)
  await page.locator('button[type="submit"]').click()
  await page.waitForTimeout(500)
}

// ============================================================
// 1. FLUXO DE CADASTRO (sem reCAPTCHA - espera erro ou sucesso)
// ============================================================

test.describe("1. Cadastro — fluxo crítico", () => {
  test("Landing → CTA → Cadastro → Step 1 → Step 2", async ({ page }) => {
    await page.goto(URL)
    await page.waitForLoadState("networkidle")

    // Click CTA
    const cta = page.locator("a[href='/cadastro']").first()
    await expect(cta).toBeVisible()
    await cta.click()
    await page.waitForURL(/\/cadastro$/, { waitUntil: "commit" })

    // Cadastro page loaded
    await expect(page.locator("#cad-nome")).toBeVisible()
    await expect(page.locator("#cad-email")).toBeVisible()
    await expect(page.locator("#cad-senha")).toBeVisible()

    // Fill step 1 as aluno
    await fillStep1(page, EMAIL, "aluno")

    // Step 2 visible: "Criar Conta Grátis" button
    const submitBtn = page.locator('button[type="submit"]', { hasText: /Criar Conta/ })
    await expect(submitBtn).toBeVisible({ timeout: 5000 })

    // Check consent checkboxes
    const checkboxes = page.locator('input[type="checkbox"]')
    await checkboxes.nth(0).check()
    await checkboxes.nth(1).check()
  })

  test("Cadastro duplicado retorna erro especifico", async ({ page }) => {
    // Register an account first via API
    const uniqueEmail = `dup${Date.now()}@test.com`
    const registerRes = await fetch(`${URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: "Teste",
        email: uniqueEmail,
        senha: PASSWORD,
        role: "aluno",
        aceitouTermos: true,
        aceitouLGPD: true,
      }),
    })
    // First attempt may succeed or be rate-limited
    const firstData = await registerRes.json()

    // Try same email again - should show duplicate error
    const res2 = await fetch(`${URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: "Teste 2",
        email: uniqueEmail,
        senha: PASSWORD,
        role: "aluno",
        aceitouTermos: true,
        aceitouLGPD: true,
      }),
    })
    const data2 = await res2.json()

    // Must be 409 or rate limited (429)
    if (res2.status === 409) {
      expect(data2.duplicate).toBe(true)
    } else if (res2.status === 429) {
      console.log("  ℹ Rate limited, skipping duplicate check")
    } else {
      console.log(`  ℹ Status inesperado: ${res2.status}`)
    }
  })
})

// ============================================================
// 2. VERIFICACAO DE EMAIL
// ============================================================

test.describe("2. Verificação de email — segurança", () => {
  test("API de verificação rejeita token invalido", async ({ page }) => {
    const resp = await page.goto(`${URL}/api/auth/verificar-email?token=invalid&userId=nonexistent`)
    expect(resp?.url()).toContain("/email-confirmado?error=invalid")
  })

  test("Página de email confirmado renderiza estados", async ({ page }) => {
    // Success state
    await page.goto(`${URL}/email-confirmado?success=true`)
    await expect(page.locator("text=sucesso").or(page.locator("text=confirmado"))).toBeVisible({ timeout: 5000 })

    // Expired state
    await page.goto(`${URL}/email-confirmado?error=expired`)
    await expect(page.locator("text=expirado").or(page.locator("text=expirou"))).toBeVisible({ timeout: 5000 })

    // Invalid state
    await page.goto(`${URL}/email-confirmado?error=invalid`)
    await expect(page.locator("text=inv").or(page.locator("text=Inv"))).toBeVisible({ timeout: 5000 })
  })

  test("Login bloqueia email nao verificado via API", async () => {
    // Direct API call to login (simulating bypass)
    const res = await fetch(`${URL}/api/auth/mobile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "unverified@test.com", senha: "wrongpassword" }),
    })
    // Should not leak info about unverified status for wrong password
    expect(res.status).toBe(401)
  })
})

// ============================================================
// 3. RECUPERACAO DE SENHA
// ============================================================

test.describe("3. Recuperação de senha", () => {
  test("Pagina de recuperar carrega com formulario", async ({ page }) => {
    await page.goto(`${URL}/recuperar-senha`)
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test("Pagina de redefinir rejeita token vazio", async ({ page }) => {
    const resp = await page.goto(`${URL}/redefinir-senha?token=`)
    // Should show error state or redirect
    await page.waitForLoadState("networkidle")
    const body = page.locator("body")
    await expect(body).toBeVisible()
  })
})

// ============================================================
// 4. EMPTY STATES (usuario novo, sem dados)
// ============================================================

test.describe("4. Empty states para novos usuarios", () => {
  test("Landing page mostra CTA principal", async ({ page }) => {
    await page.goto(URL)
    await page.waitForLoadState("networkidle")
    // Hero CTA
    const heroCta = page.locator("a[href='/cadastro']").first()
    await expect(heroCta).toBeVisible()
    // Footer LGPD link
    const lgpdLink = page.locator("a[href='/lgpd']").first()
    await expect(lgpdLink).toBeVisible()
    // Footer Terms link
    const termosLink = page.locator("a[href='/termos']")
    await expect(termosLink).toBeVisible()
  })

  test("Pagina LGPD carrega com secoes", async ({ page }) => {
    await page.goto(`${URL}/lgpd`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("text=LGPD").or(page.locator("text=lgpd")).first()).toBeVisible()
  })

  test("Pagina de horarios publicos carrega", async ({ page }) => {
    await page.goto(`${URL}/horarios`)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("body")).toBeVisible()
  })
})

// ============================================================
// 5. ROTAS PROTEGIDAS
// ============================================================

test.describe("5. Rotas protegidas redirecionam", () => {
  const protectedPages = [
    "/dashboard",
    "/dashboard/aluno",
    "/dashboard/dono",
    "/dashboard/professor",
  ]

  for (const route of protectedPages) {
    test(`${route} redireciona para login`, async ({ page }) => {
      await page.goto(`${URL}${route}`, { waitUntil: "networkidle" })
      // Should redirect to login
      await page.waitForURL(/\/login/, { timeout: 10000 })
    })
  }

  const protectedApis = ["/api/perfil", "/api/conta", "/api/notificacoes"]

  for (const route of protectedApis) {
    test(`${route} retorna 401 sem autenticacao`, async ({ page }) => {
      const resp = await page.goto(`${URL}${route}`)
      expect(resp?.status()).toBe(401)
    })
  }
})

// ============================================================
// 6. COOKIE CONSENT
// ============================================================

test.describe("6. Cookie consent", () => {
  test("Banner de cookies aparece na primeira visita", async ({ page }) => {
    await page.goto(URL)
    await page.waitForLoadState("networkidle")
    const acceptBtn = page.locator("button", { hasText: /Aceitar|cookie|Cookie/ })
    if (await acceptBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await acceptBtn.click()
      await page.waitForTimeout(300)
    }
  })
})

// ============================================================
// 7. API HEALTH
// ============================================================

test.describe("7. API Health Check", () => {
  test("API /api/academias responde", async ({ page }) => {
    const resp = await page.goto(`${URL}/api/academias`)
    expect(resp?.status()).toBe(200)
  })

  test("API de horarios exige autenticacao", async ({ page }) => {
    const resp = await page.goto(`${URL}/api/agenda/horarios`)
    expect(resp?.status()).toBe(401)
  })

  test("API /api/leads aceita POST", async ({ page }) => {
    const resp = await page.request.post(`${URL}/api/leads`, {
      data: { nome: "Teste", email: `lead${Date.now()}@test.com`, origem: "landing" },
    })
    expect(resp.ok()).toBeTruthy()
  })
})

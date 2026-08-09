import { test, expect, type Page } from "@playwright/test"
import { URL } from "./constants"
import { resetRateLimits, preparePage } from "./helpers"

const stamp = Date.now().toString(36)
const PWD = "Senha123"
const emailFor = (role: string) => `qa-${stamp}-${role}@test.com`

async function fillStep1(page: Page, opts: { nome: string; email: string; senha?: string; confirmar?: string; role?: string }) {
  await page.fill("#cad-nome", opts.nome)
  await page.fill("#cad-email", opts.email)
  await page.fill("#cad-senha", opts.senha ?? PWD)
  await page.fill("#cad-confirmar-senha", opts.confirmar ?? opts.senha ?? PWD)
  if (opts.role === "professor") await page.getByRole("button", { name: "Professor" }).click()
  if (opts.role === "dono") await page.getByRole("button", { name: "Dono de Academia" }).click()
  await page.getByRole("button", { name: "Próximo" }).click()
  await expect(page.getByRole("button", { name: "Criar Conta Grátis" })).toBeVisible({ timeout: 10000 })
}

async function fillStep2(page: Page, role: string) {
  if (role === "dono") {
    await page.getByPlaceholder("Ex: Nova União").fill(`QA Academia ${stamp}`)
  } else if (role === "aluno") {
    await page.getByRole("button", { name: "Não encontrei minha academia" }).click()
  }
  await page.locator('label:has-text("Aceito os Termos") input').check()
  await page.locator('label:has-text("Autorizo o tratamento") input').check()
}

async function signup(page: Page, opts: { role: string; nome: string; email: string; senha?: string; prepare?: boolean; initScript?: () => void }) {
  await resetRateLimits()
  if (opts.initScript) {
    await page.addInitScript(opts.initScript)
  } else if (opts.prepare !== false) {
    await preparePage(page)
  }
  await page.goto(`${URL}/cadastro`, { waitUntil: "domcontentloaded" })
  await fillStep1(page, { nome: opts.nome, email: opts.email, senha: opts.senha, role: opts.role })
  await fillStep2(page, opts.role)
  await page.getByRole("button", { name: "Criar Conta Grátis" }).click()
}

test("ALUNO - cadastro completo + auto-login (desktop 1440)", async ({ browser }) => {
  test.setTimeout(90000)
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const email = emailFor("aluno")
  await signup(page, { role: "aluno", nome: "QA Aluno", email })
  await page.waitForURL(/\/dashboard\/aluno/, { timeout: 20000 })
  await expect(page.getByRole("heading", { name: "Verifique seu e-mail" })).toBeHidden()
  await ctx.close()
})

test("ALUNO - jornada completa mobile 390px", async ({ browser }) => {
  test.setTimeout(90000)
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  const email = emailFor("aluno-mob")
  await signup(page, { role: "aluno", nome: "QA Aluno Mobile", email })
  await page.waitForURL(/\/dashboard\/aluno/, { timeout: 20000 })
  await ctx.close()
})

test("PROFESSOR - cadastro completo + auto-login", async ({ browser }) => {
  test.setTimeout(90000)
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  const email = emailFor("prof")
  await signup(page, { role: "professor", nome: "QA Professor", email })
  await page.waitForURL(/\/dashboard\/professor/, { timeout: 20000 })
  await ctx.close()
})

test("DONO - cadastro completo + auto-login", async ({ browser }) => {
  test.setTimeout(90000)
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  const email = emailFor("dono")
  await signup(page, { role: "dono", nome: "QA Dono", email })
  await page.waitForURL(/\/dashboard\/dono/, { timeout: 20000 })
  await ctx.close()
})

test("ALUNO novo - onboarding em sequência, sem sobreposição", async ({ browser }) => {
  test.setTimeout(90000)
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  const email = emailFor("onb")
  await signup(page, {
    role: "aluno",
    nome: "QA Onboarding",
    email,
    initScript: () => {
      localStorage.setItem("osstrack_cookie_consent", "true")
      localStorage.setItem("pwa-install-dismissed", "true")
      localStorage.setItem("osstrack_push_dismissed", "true")
    },
  })

  await page.waitForURL(/\/dashboard\/aluno/, { timeout: 20000 })

  const pwaBtn = page.getByRole("button", { name: "Já adicionei! Continuar →" })
  await expect(pwaBtn).toBeVisible({ timeout: 20000 })
  await expect(page.getByText("Faça seu primeiro check-in")).toBeHidden()

  await pwaBtn.click()

  const pushSkip = page.getByRole("button", { name: "Agora não" })
  await expect(pushSkip).toBeVisible({ timeout: 10000 })
  await expect(pwaBtn).toBeHidden()

  await pushSkip.click()

  const skipTour = page.getByRole("button", { name: "Pular tour" })
  await expect(skipTour).toBeVisible({ timeout: 15000 })
  await expect(page.getByText("Faça seu primeiro check-in")).toBeHidden()

  await skipTour.click()
  await expect(skipTour).toBeHidden()
  await expect(pwaBtn).toBeHidden()
  await expect.poll(() => page.evaluate(() => localStorage.getItem("osstrack_tour_aluno"))).toBe("true")
  await ctx.close()
})

test("USUÁRIO - volta e entra em nova sessão após cadastro", async ({ browser }) => {
  const email = emailFor("ret")
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await signup(page, { role: "aluno", nome: "QA Retorno", email })
  await page.waitForURL(/\/dashboard\/aluno/, { timeout: 20000 })
  await ctx.close()

  const ctx2 = await browser.newContext()
  const p2 = await ctx2.newPage()
  await resetRateLimits()
  await preparePage(p2)
  await p2.goto(`${URL}/login`, { waitUntil: "domcontentloaded" })
  await p2.fill('input[type="email"]', email)
  await p2.fill('input[type="password"]', PWD)
  await p2.click('button[type="submit"]')
  await p2.waitForURL(/\/dashboard\/aluno/, { timeout: 20000 })
  await ctx2.close()
})

test("API - register sinaliza verificationRequired=false sem SMTP", async ({ request }) => {
  await resetRateLimits()
  const res = await request.post(`${URL}/api/auth/register`, {
    data: {
      nome: "QA API",
      email: emailFor("api"),
      telefone: "",
      senha: PWD,
      role: "aluno",
      faixa: "Branca",
      grau: 0,
      aceitouTermos: true,
      aceitouLGPD: true,
      aceitouMarketing: false,
      consentimentoResponsavel: false,
    },
  })
  expect(res.ok()).toBeTruthy()
  const body = await res.json()
  expect(body.verificationRequired).toBe(false)
})

test("NEGATIVO - e-mail inválido", async ({ browser }) => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await resetRateLimits()
  await preparePage(page)
  await page.goto(`${URL}/cadastro`, { waitUntil: "domcontentloaded" })
  await page.fill("#cad-nome", "QA Neg")
  await page.fill("#cad-email", "teste@semdominio")
  await page.fill("#cad-senha", PWD)
  await page.fill("#cad-confirmar-senha", PWD)
  await page.getByRole("button", { name: "Próximo" }).click()
  await expect(page.getByRole("alert").filter({ hasText: "E-mail inválido" })).toBeVisible()
  await ctx.close()
})

test("NEGATIVO - senha sem letra maiúscula", async ({ browser }) => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await resetRateLimits()
  await preparePage(page)
  await page.goto(`${URL}/cadastro`, { waitUntil: "domcontentloaded" })
  await page.fill("#cad-nome", "QA Neg")
  await page.fill("#cad-email", emailFor("neg-pass"))
  await page.fill("#cad-senha", "abcdef12")
  await page.fill("#cad-confirmar-senha", "abcdef12")
  await page.getByRole("button", { name: "Próximo" }).click()
  await expect(page.getByRole("alert").filter({ hasText: "A senha deve conter pelo menos uma letra maiúscula" })).toBeVisible()
  await ctx.close()
})

test("NEGATIVO - senhas não conferem", async ({ browser }) => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await resetRateLimits()
  await preparePage(page)
  await page.goto(`${URL}/cadastro`, { waitUntil: "domcontentloaded" })
  await page.fill("#cad-nome", "QA Neg")
  await page.fill("#cad-email", emailFor("neg-mismatch"))
  await page.fill("#cad-senha", PWD)
  await page.fill("#cad-confirmar-senha", `${PWD}x`)
  await page.getByRole("button", { name: "Próximo" }).click()
  await expect(page.getByRole("alert").filter({ hasText: "As senhas não conferem" })).toBeVisible()
  await ctx.close()
})

test("NEGATIVO - termos não aceitos", async ({ browser }) => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await resetRateLimits()
  await preparePage(page)
  await page.goto(`${URL}/cadastro`, { waitUntil: "domcontentloaded" })
  await fillStep1(page, { nome: "QA Neg", email: emailFor("neg-terms") })
  await page.getByRole("button", { name: "Não encontrei minha academia" }).click()
  await page.getByRole("button", { name: "Criar Conta Grátis" }).click()
  await expect(page.getByRole("alert").filter({ hasText: "Você precisa aceitar os Termos de Uso e a Política de Privacidade" })).toBeVisible()
  await ctx.close()
})

test("NEGATIVO - e-mail duplicado", async ({ browser }) => {
  const email = emailFor("dup")
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await signup(page, { role: "aluno", nome: "QA Dup", email })
  await page.waitForURL(/\/dashboard\/aluno/, { timeout: 20000 })
  await ctx.close()

  const ctx2 = await browser.newContext()
  const p2 = await ctx2.newPage()
  await resetRateLimits()
  await preparePage(p2)
  await p2.goto(`${URL}/cadastro`, { waitUntil: "domcontentloaded" })
  await fillStep1(p2, { nome: "QA Dup 2", email })
  await fillStep2(p2, "aluno")
  await p2.getByRole("button", { name: "Criar Conta Grátis" }).click()
  await expect(p2.getByRole("alert").filter({ hasText: "Este e-mail já está cadastrado" })).toBeVisible({ timeout: 15000 })
  await ctx2.close()
})

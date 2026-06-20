import { chromium } from "@playwright/test"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { writeFileSync } from "fs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, "..", "public", "screenshots")

const URL = process.env.CAPTURE_URL || "http://localhost:3000"

async function capture(page, path, name) {
  await page.goto(`${URL}${path}`, { waitUntil: "load", timeout: 15000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: false })
  console.log(`  ✓ ${name}.png`)
}

async function main() {
  console.log(`\nCapturing screenshots from ${URL}\n`)

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2,
  })
  const page = await ctx.newPage()

  // Aluno dashboard
  console.log("Aluno dashboard:")
  await capture(page, "/screenshot/demo", "demo-aluno")

  // Dono dashboard (demo page, no login needed)
  console.log("Dono dashboard:")
  await capture(page, "/screenshot/demo/dono", "demo-dono")

  // Dono dashboard (real, requires login)
  console.log("Dono dashboard real:")
  await page.goto(`${URL}/api/setup`, { waitUntil: "load", timeout: 15000 })
  await page.goto(`${URL}/login`, { waitUntil: "load", timeout: 15000 })
  await page.waitForTimeout(500)
  await page.fill('input[type="email"]', "carlos@email.com")
  await page.fill('input[type="password"]', "123456")
  await page.click('button[type="submit"]')
  await page.waitForTimeout(5000)
  await page.screenshot({ path: join(OUT, "demo-dono-real.png"), fullPage: false })
  console.log(`  ✓ demo-dono-real.png (${page.url()})`)

  // Landing page
  console.log("Landing page:")
  await capture(page, "/", "landing")

  await browser.close()
  console.log("\nDone! Screenshots saved to public/screenshots/\n")
}

main().catch((err) => {
  console.error("Failed:", err)
  process.exit(1)
})

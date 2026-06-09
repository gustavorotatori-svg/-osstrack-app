import { chromium } from "playwright"

async function main() {
  const browser = await chromium.launch({ headless: true, channel: "chrome" })
  const ctx = await browser.newContext()
  const page = await ctx.newPage()

  const resp = await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded", timeout: 30000 })
  console.log("Status:", resp?.status())
  
  const html = await page.content()
  console.log("HTML (first 2000):", html.slice(0, 2000))

  await page.waitForTimeout(5000)
  console.log("\nAfter 5s URL:", page.url())
  console.log("After 5s HTML (first 2000):", (await page.content()).slice(0, 2000))

  await browser.close()
}

main().catch(console.error)

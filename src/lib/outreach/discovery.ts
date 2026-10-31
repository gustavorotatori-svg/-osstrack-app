import { load } from "cheerio"
import { lookup, resolveMx } from "node:dns/promises"
import { isIP } from "node:net"
import { request as httpsRequest } from "node:https"
import { excludedBrand, normalize, type Prospect } from "./policy"

const POPULATION_URL = "https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/-1/variaveis/9324?localidades=N6[all]"
const REGISTRY = "https://www.cbjjp.com/school-registered-2023"
const trustedProviders = new Set(["servicodados.ibge.gov.br", "dns.google", "www.cbjjp.com", "www.bing.com", "forum.bjjforum.com.br"])
export interface City { name: string; uf: string; population: number; code: string; year: number }
interface PopulationSeries { localidade: { id: string; nome: string }; serie: Record<string, string> }
const priority = ["PA", "MA", "RN", "PB", "CE", "PE", "AL", "PI", "SE", "BA", "AM", "AC", "RO", "RR", "AP", "TO", "ES"]
export function publicAddress(ip: string): boolean {
  if (ip.startsWith("64:ff9b::")) {
    const parts = ip.slice(9).split(":").map(s => parseInt(s, 16))
    return parts.length === 2 && publicAddress(`${parts[0] >> 8}.${parts[0] & 255}.${parts[1] >> 8}.${parts[1] & 255}`)
  }
  if (ip.includes(":")) return /^[23][0-9a-f]{0,3}:/i.test(ip) && !ip.includes(".")
  const [a, b] = ip.split(".").map(Number)
  return !(a === 0 || a === 10 || a === 127 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168 || a === 100 && b >= 64 && b <= 127 || a >= 224)
}
// Public research links are untrusted; validate each redirect and cap response size.
export async function fetchPublic(url: string, remaining = 3): Promise<string> {
  const u = new URL(url)
  if (u.protocol !== "https:" || u.username || u.password || u.port && u.port !== "443" || isIP(u.hostname) || !u.hostname.includes(".")) throw new Error("unsafe_source")
  // Fixed public providers use the platform's HTTP transport. Candidate sites still
  // use pinned, validated DNS below; a provider redirect is validated again.
  if (trustedProviders.has(u.hostname)) {
    const response = await fetch(u, { redirect: "manual", signal: AbortSignal.timeout(15000), headers: { "user-agent": "OssTrackResearch/1.0 (+https://osstrack.com.br)", accept: "text/html,application/json" } })
    if (response.status >= 300 && response.status < 400 && remaining > 0) return fetchPublic(new URL(response.headers.get("location") || "", u).href, remaining - 1)
    if (!response.ok || !/html|json|xml|text/.test(response.headers.get("content-type") || "")) throw new Error(`source_http_${response.status}`)
    const chunks: Uint8Array[] = []; let bytes = 0; const reader = response.body!.getReader()
    while (true) { const { done, value } = await reader.read(); if (done) break; bytes += value.length; if (bytes > 2500000) { await reader.cancel(); throw new Error("source_too_large") }; chunks.push(value) }
    return Buffer.concat(chunks).toString("utf8")
  }
  let dnsTimer: NodeJS.Timeout | undefined
  const ips = await Promise.race([
    lookup(u.hostname, { all: true }),
    new Promise<never>((_, reject) => { dnsTimer = setTimeout(() => reject(new Error("source_dns_timeout")), 5000) }),
  ]).finally(() => { if (dnsTimer) clearTimeout(dnsTimer) })
  if (!ips.length || ips.some(x => !publicAddress(x.address))) throw new Error("unsafe_source")
  const address = ips.find(ip => ip.family === 4) || ips[0]
  // Pin the validated IP so a second DNS lookup cannot rebind to a private service.
  const r = await new Promise<{ status: number; type: string; location?: string; body: string }>((resolve, reject) => {
    const req = httpsRequest({ hostname: u.hostname, family: address.family, lookup: (_host, options, callback) => { if (options.all) callback(null, ips); else callback(null, address.address, address.family) }, servername: u.hostname, path: u.pathname + u.search, signal: AbortSignal.timeout(10000), headers: { host: u.host, "user-agent": "OssTrackResearch/1.0 (+https://osstrack.com.br)", accept: "text/html,application/json" } }, res => {
      const chunks: Buffer[] = []; let size = 0
      res.on("data", (chunk: Buffer) => { size += chunk.length; if (size > 2500000) req.destroy(new Error("source_too_large")); else chunks.push(chunk) })
      res.on("end", () => resolve({ status: res.statusCode || 0, type: String(res.headers["content-type"] || ""), location: res.headers.location, body: Buffer.concat(chunks).toString("utf8") }))
      res.on("error", reject)
    }); req.on("error", reject); req.end()
  })
  if (r.status >= 300 && r.status < 400 && remaining > 0 && r.location) return fetchPublic(new URL(r.location, u).href, remaining - 1)
  if (r.status < 200 || r.status >= 300 || !/html|json|xml|text/.test(r.type)) throw new Error(`source_http_${r.status}`)
  return r.body
}
export async function hasMx(domain: string) {
  try { return (await resolveMx(domain)).some(r => r.exchange && r.exchange !== ".") }
  catch {
    const r = JSON.parse(await fetchPublic(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`))
    if (r.Status !== 0) throw new Error("mx_unavailable")
    return (r.Answer || []).some((a: { type: number; data: string }) => a.type === 15 && !/^0\s+\.?$/.test(a.data))
  }
}
export async function cities(): Promise<City[]> {
  const data = JSON.parse(await fetchPublic(POPULATION_URL))
  const rows: PopulationSeries[] = data[0]?.resultados[0]?.series || []
  if (rows.length < 5000) throw new Error("ibge_incomplete")
  return rows.map(r => {
    const [name, uf] = r.localidade.nome.split(/ - (?=[A-Z]{2}$)/)
    const year = Math.max(...Object.keys(r.serie).map(Number))
    return { name, uf, code: r.localidade.id, population: Number(r.serie[String(year)]), year }
  }).filter(c => c.uf && c.population > 0 && c.population < 500000 && c.year >= new Date().getUTCFullYear() - 1)
    .sort((a, b) => (priority.indexOf(a.uf) < 0 ? 99 : priority.indexOf(a.uf)) - (priority.indexOf(b.uf) < 0 ? 99 : priority.indexOf(b.uf)) || b.population - a.population)
}
export function populationSource(c: City) { return `https://www.ibge.gov.br/cidades-e-estados/${c.uf.toLowerCase()}/${normalize(c.name).replace(/ /g, "-")}.html` }
const emails = (text: string) => [...new Set((text.replace(/[\u200b-\u200d\ufeff]/g, "").match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).map(e => e.toLowerCase()))]
export function registryProspects(html: string, municipalities: City[]): Prospect[] {
  const $ = load(html); $("script,style,nav,footer").remove()
  $("br").replaceWith(" "); $("p,h1,h2,h3,h4,h5,h6,span").append(" ")
  const out: Prospect[] = []; const headings = $("h4").toArray(); const schoolText = $("body").text()
  for (let i = 0; i < headings.length; i++) {
    const nome = $(headings[i]).text().trim()
    if (nome === "ADDRESS" || excludedBrand.test(normalize(nome)) || !nome || nome.length > 100) continue
    const begin = schoolText.indexOf(nome)
    const nextName = headings.slice(i + 1).map(h => $(h).text().trim()).find(n => n && n !== "ADDRESS")
    const end = nextName ? schoolText.indexOf(nextName, begin + nome.length) : schoolText.length
    const block = schoolText.slice(begin, end < 0 ? schoolText.length : end); const n = normalize(block)
    if (!/\bbrazil\b/.test(n) || excludedBrand.test(n) || /projeto|proj |federacao|confederacao/.test(normalize(nome))) continue
    const matches = municipalities.filter(c => new RegExp(`\\b${normalize(c.name)}\\b`).test(n) && new RegExp(`\\b${c.uf.toLowerCase()}\\b`).test(n))
    const contact = emails(block)
    if (matches.length !== 1 || contact.length !== 1) continue
    const c = matches[0]
    out.push({ nome, email: contact[0], cidade: c.name, estado: c.uf, populacao: c.population, populationSource: populationSource(c), source: REGISTRY, checkedAt: new Date().toISOString().slice(0, 10), independent: true, qualification: "Escola de marca própria e contato comercial no registro público CBJJP. Município e UF correspondem univocamente ao IBGE atual. Independência inferida da marca local; grandes redes excluídas. Fonte não certifica número de alunos." })
  }
  return out
}
const directories = /facebook|instagram|youtube|linkedin|tiktok|google|bing|duckduckgo|solutudo|econodata|cnpj|casadosdados|todosnegocios|cylex|wellhub|totalpass|letsroll|bjjmetrics|bjjlf|jiujitsublog|graciemag|bjjforum|\.gov\.br|\.edu\.br|wikipedia|pinterest|findglocal|localgyms|hotfrog|benditoguia|encontra|localtreino/i
export function siteProspect(html: string, source: string, c: City): Prospect | null {
  const $ = load(html); $("script,style,nav").remove()
  $("br").replaceWith(" "); $("p,h1,h2,h3,h4,h5,h6,li,a,div,address,span").append(" ")
  const text = $("body").text().replace(/\s+/g, " "); const n = normalize(text)
  const title = ($('meta[property="og:site_name"]').attr("content") || $("title").text() || $("h1").first().text()).split(/[|–—]/)[0].trim()
  const host = new URL(source).hostname.replace(/^www\./, "")
  if (directories.test(host) || !/jiu[ -]?jitsu|brazilian jiu/.test(n) || !n.includes(normalize(c.name)) || !new RegExp(`\\b${c.uf.toLowerCase()}\\b`).test(n) || excludedBrand.test(n) || /franquia|franchise|licenciad/.test(n) || title.length < 4 || title.length > 100) return null
  const tokens = normalize(title).split(" ").filter(t => t.length >= 4 && !/academia|jiu|jitsu|brazilian|contato|home|escola|inicio|treinamento/.test(t))
  const contacts = emails(text + " " + $("a[href^='mailto:']").map((_, a) => $(a).attr("href")).get().join(" "))
    .filter(e => !/noreply|no-reply|example|exemplo|wixpress|sentry/.test(e) && (e.split("@")[1] === host || tokens.some(t => normalize(e.split("@")[0]).replace(/ /g, "").includes(t))))
  const addressMatch = new RegExp(`(?:rua|avenida|av|endereco|localizacao)\\b.{0,300}\\b${normalize(c.name)}\\b.{0,25}\\b${c.uf.toLowerCase()}\\b`).test(n)
  if (contacts.length !== 1 || !addressMatch) return null
  return { nome: title, email: contacts[0], cidade: c.name, estado: c.uf, populacao: c.population, populationSource: populationSource(c), source, checkedAt: new Date().toISOString().slice(0, 10), independent: true, qualification: "Site da própria escola: modalidade, cidade/UF, endereço e contato comercial de domínio próprio ou alinhado ao nome da marca. Operação local inferida; páginas com grandes redes/franquias são recusadas. Porte em alunos não comprovado." }
}
async function websiteSeeds() {
  // Historical directories discover URLs only. Never import their old emails as qualified contacts.
  const html = await fetchPublic("https://forum.bjjforum.com.br/viewtopic.php?start=15&t=3410")
  const $ = load(html)
  return [...new Set($("a.postlink").map((_, a) => {
    try { const u = new URL($(a).attr("href") || ""); u.protocol = "https:"; return u.href } catch { return "" }
  }).get().filter(u => u && !directories.test(new URL(u).hostname) && !excludedBrand.test(normalize(u))))]
}
export async function discover(cursor: number, blocked: Set<string>, budgetMs = 110000, progress?: (found: Prospect[], cursor: number) => Promise<void>) {
  const started = Date.now(); const municipality = await cities(); const found: Prospect[] = []; const errors: string[] = []
  try { found.push(...registryProspects(await fetchPublic(REGISTRY), municipality).filter(p => !blocked.has(p.email))) } catch { errors.push("registry_unavailable") }
  await progress?.(found, cursor)
  let searched = 0; const targets = municipality.filter(c => c.population >= 20000)
  let seeds: string[] = []
  try { seeds = await websiteSeeds() } catch { errors.push("website_directory_unavailable") }
  // Rotate over current first-party websites, confirming all facts again on every visit.
  let inspected = 0
  while (inspected < Math.min(32, seeds.length) && Date.now() - started < budgetMs * 0.75) {
    const url = seeds[(cursor + inspected) % seeds.length]; inspected++
    try {
      const html = await fetchPublic(url); const $ = load(html); $("script,style,nav").remove(); $("br").replaceWith(" "); $("p,div,span,a,address,footer").append(" ")
      const n = normalize($("body").text())
      const matches = municipality.filter(c => new RegExp(`(?:rua|avenida|av|endereco|localizacao)\\b.{0,300}\\b${normalize(c.name)}\\b.{0,25}\\b${c.uf.toLowerCase()}\\b`).test(n))
      if (matches.length === 1) {
        const p = siteProspect(html, url, matches[0])
        if (p && !blocked.has(p.email) && !found.some(x => x.email === p.email)) found.push(p)
      }
    } catch { /* Dead or changed historical URLs do not qualify. */ }
    await progress?.(found, cursor + inspected)
  }
  cursor += inspected
  while (searched < 48 && Date.now() - started < budgetMs && found.length < 50) {
    const c = targets[(cursor + searched) % targets.length]; searched++
    try {
      const query = `academia jiu jitsu "${c.name}" "${c.uf}" contato email -gracie -alliance -checkmat`
      const html = await fetchPublic(`https://www.bing.com/search?format=rss&q=${encodeURIComponent(query)}`)
      const $ = load(html, { xml: true })
      const links = $("item").filter((_, a) => normalize($(a).find("title,description").text()).includes(normalize(c.name))).find("link").map((_, a) => $(a).text().trim()).get().filter(u => u.startsWith("https://") && !directories.test(new URL(u).hostname)).slice(0, 4)
      if (!$("item").length) errors.push(`search_no_results:${c.code}`)
      for (const url of links) { if (Date.now() - started > budgetMs) break; try { const p = siteProspect(await fetchPublic(url), url, c); if (p && !blocked.has(p.email) && !found.some(x => x.email === p.email)) found.push(p) } catch { /* Offline sources remain unqualified. */ } }
    } catch (error) { errors.push(`search_failed:${c.code}:${error instanceof Error ? error.message : "unknown"}`) }
    await progress?.(found, (cursor + searched) % targets.length)
  }
  return { found, cursor: (cursor + searched) % targets.length, searched, errors }
}

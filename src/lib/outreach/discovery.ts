import { load } from "cheerio"
import { lookup, resolveMx } from "node:dns/promises"
import { isIP } from "node:net"
import { request as httpsRequest } from "node:https"
import { excludedBrand, normalize, type Prospect } from "./policy"
import snapshot from "./ibge-snapshot.json"

const POPULATION_URL = "https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/-1/variaveis/9324?localidades=N6[all]"
const REGISTRY = "https://www.cbjjp.com/school-registered-2023"
const trustedProviders = new Set(["servicodados.ibge.gov.br", "dns.google", "www.cbjjp.com", "www.bing.com", "forum.bjjforum.com.br", "www.bjj.international"])
export interface City { name: string; uf: string; population: number; code: string; year: number; evidence?: "live" | "verified_snapshot" }
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
  let values: City[]
  try {
    const data = JSON.parse(await fetchPublic(POPULATION_URL))
    const rows: PopulationSeries[] = data[0]?.resultados[0]?.series || []
    if (rows.length < 5000) throw new Error("ibge_incomplete")
    values = rows.map(r => {
      const [name, uf] = r.localidade.nome.split(/ - (?=[A-Z]{2}$)/)
      const year = Math.max(...Object.keys(r.serie).map(Number))
      return { name, uf, code: r.localidade.id, population: Number(r.serie[String(year)]), year, evidence: "live" as const }
    })
  } catch {
    if (Date.now() - Date.parse(snapshot.retrievedAt) > 366 * 86400000) throw new Error("ibge_snapshot_expired")
    // An audited copy of official annual data keeps source outages from stopping
    // the queue. Near-threshold cities require a successful live verification.
    values = snapshot.cities.filter(c => c.population < 450000).map(c => ({ ...c, evidence: "verified_snapshot" as const }))
  }
  return values.filter(c => c.uf && c.population > 0 && c.population < 500000 && c.year >= new Date().getUTCFullYear() - 1)
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
  const $ = load(html); const structuredData = normalize($("script[type='application/ld+json']").text()); $("script,style,nav").remove()
  $("br").replaceWith(" "); $("p,h1,h2,h3,h4,h5,h6,li,a,div,address,span").append(" ")
  const text = $("body").text().replace(/\s+/g, " "); const n = normalize(text)
  const title = ($('meta[property="og:site_name"]').attr("content") || $("title").text() || $("h1").first().text()).split(/[|–—]/)[0].trim()
  const host = new URL(source).hostname.replace(/^www\./, "")
  if (directories.test(host) || !/jiu[ -]?jitsu|brazilian jiu/.test(n) || !n.includes(normalize(c.name)) || !new RegExp(`\\b${c.uf.toLowerCase()}\\b`).test(n) || excludedBrand.test(n) || /franquia|franchise|licenciad/.test(n) || title.length < 4 || title.length > 100) return null
  // A published Gmail/Outlook address is a valid academy contact when it is
  // present on the academy's own site. The first-party page itself establishes
  // the association; requiring a matching email domain was excluding small gyms.
  const usable = (email: string) =>
    !/noreply|no-reply|example|exemplo|wixpress|sentry|privacidade|privacy|lgpd|dpo/i.test(email) &&
    !/(?:^|[._+-])(?:webdesigner|webdeveloper|webmaster|agency|agencia)(?:[._+-]|@)/i.test(email)
  const contacts = emails(text + " " + $("a[href^='mailto:']").map((_, a) => $(a).attr("href")).get().join(" ")).filter(usable)
  const mailtoLinks = $("a[href^='mailto:']").toArray().map(a => ({
    email: emails($(a).attr("href") || "").find(usable),
    label: normalize(`${$(a).text()} ${$(a).attr("aria-label") || ""} ${$(a).attr("title") || ""}`),
  })).filter(x => x.email)
  const labelledContacts = [...new Set(mailtoLinks.filter(x => /contato|contact|fale|email|secretaria|matricula|atendimento/.test(x.label)).map(x => x.email!))]
  const preferred = contacts.filter(e => /^(contato|contact|atendimento|secretaria|academia|comercial|matricula|info|professor|dojo|equipe)[._+-]?/i.test(e.split("@")[0]))
  const contact = labelledContacts.length === 1 ? labelledContacts[0]
    : preferred.length === 1 ? preferred[0]
      : contacts.length === 1 ? contacts[0] : null
  const city = normalize(c.name)
  const uf = c.uf.toLowerCase()
  const addressMatch = new RegExp(`(?:rua|avenida|av|endereco|localizacao)\\b.{0,300}\\b${city}\\b.{0,25}\\b${uf}\\b`).test(n)
    || new RegExp(`(?:academia|dojo|unidade|estamos|visite|localizado|localizada|treinos? em|aulas? em)\\b.{0,180}\\b${city}\\b.{0,25}\\b${uf}\\b`).test(n)
    || new RegExp(`\\b${city}\\b.{0,15}\\b${uf}\\b`).test(structuredData)
  if (!contact || !addressMatch) return null
  const personalization = personalizationFromSite(n) || {
    personalization: `a academia oferece Jiu-Jitsu em ${c.name}`,
    personalizedQuestion: "Como vocês organizam hoje as turmas, os alunos e as presenças?",
  }
  return { nome: title, email: contact, cidade: c.name, estado: c.uf, populacao: c.population, populationSource: populationSource(c), source, checkedAt: new Date().toISOString().slice(0, 10), independent: true, qualification: "Site da própria escola: modalidade, cidade/UF, endereço ou localização estruturada e contato comercial publicado. Operação local inferida; grandes redes/franquias são recusadas. Porte em alunos não comprovado.", ...personalization, personalizationSource: source }
}

function personalizationFromSite(text: string): Pick<Prospect, "personalization" | "personalizedQuestion"> | null {
  if (/turmas? (?:de |para )?criancas|aulas? (?:de |para )?criancas|turmas? infantis|aulas? infantis|kids classes|jiu.?jitsu kids/.test(text)) {
    return { personalization: "vocês mantêm turmas infantis", personalizedQuestion: "Como vocês acompanham hoje as presenças e graduações das turmas infantis?" }
  }
  if (/jiu.?jitsu feminino|treino feminino|aulas? para mulheres|turma (?:de )?mulheres/.test(text)) {
    return { personalization: "vocês oferecem treinos de Jiu-Jitsu para mulheres", personalizedQuestion: "Como organizam hoje a frequência e os horários dessas alunas?" }
  }
  if (/aulas? para iniciantes|turma (?:de )?iniciantes|para (?:quem esta comecando|comecar no jiu)|first class|beginners?/.test(text)) {
    return { personalization: "vocês recebem alunos iniciantes", personalizedQuestion: "Como acompanham quem está começando e a evolução das primeiras faixas?" }
  }
  if (/aula experimental|aula gratis|aula gratuita|trial class/.test(text)) {
    return { personalization: "vocês oferecem aula experimental para novos alunos", personalizedQuestion: "Como acompanham quem faz a aula experimental e decide continuar?" }
  }
  if (/horarios? (?:das|de) (?:aulas|turmas|treinos)|grade de horarios|class schedule|segunda.{0,30}sexta|segunda.{0,15}sabado/.test(text)) {
    return { personalization: "vocês publicam os horários das aulas", personalizedQuestion: "Como vocês controlam hoje a frequência dos alunos em cada turma?" }
  }
  if (/graduacao|faixas? (?:de jiu|dos alunos)|belt progression/.test(text)) {
    return { personalization: "vocês destacam o acompanhamento das graduações e faixas", personalizedQuestion: "Como vocês acompanham hoje a frequência e a evolução das faixas?" }
  }
  return null
}
async function websiteSeeds() {
  // Historical directories discover URLs only. Never import their old emails as qualified contacts.
  const html = await fetchPublic("https://forum.bjjforum.com.br/viewtopic.php?start=15&t=3410")
  const $ = load(html)
  return [...new Set($("a.postlink").map((_, a) => {
    try { const u = new URL($(a).attr("href") || ""); u.protocol = "https:"; return u.href } catch { return "" }
  }).get().filter(u => u && !directories.test(new URL(u).hostname) && !excludedBrand.test(normalize(u))))]
}
async function certifiedAcademyDirectory(municipalities: City[], started: number, budgetMs: number, cursor: number): Promise<{ cities: City[]; websites: string[]; prospects: Prospect[] }> {
  // Rotate through current CBJJE pages. A profile can be a source when it
  // publishes the academy's own contact, city, and certification status.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date())
  const part = (type: string) => parts.find(x => x.type === type)?.value || "0"
  const day = Date.UTC(Number(part("year")), Number(part("month")) - 1, Number(part("day"))) / 86400000
  const slot = day * 2 + (Number(part("hour")) >= 14 ? 1 : 0)
  const pageStart = ((slot + Math.floor(cursor / 25)) % 37) + 1
  const pageNumbers = [0, 1, 2].map(offset => ((pageStart + offset - 1) % 37) + 1)
  const found = new Map<string, City>()
  const profiles = new Map<string, { url: string; city: City }>()
  for (const pageNumber of pageNumbers) {
    if (Date.now() - started > Math.min(30000, budgetMs * 0.2)) break
    try {
      const html = await fetchPublic(`https://www.bjj.international/academies?page=${pageNumber}`)
      const $ = load(html)
      for (const anchor of $("a[href^='/academies/']").toArray()) {
        const href = $(anchor).attr("href") || ""
        if (!href || href === "/academies/map") continue
        const text = normalize($(anchor).text())
        const matches = municipalities.filter(c => new RegExp(`\\b${normalize(c.name)}\\b`).test(text) && new RegExp(`\\b${c.uf.toLowerCase()}\\b`).test(text))
        if (matches.length !== 1 || matches[0].population < 20000) continue
        const city = matches[0]
        found.set(city.code, city)
        const url = new URL(href, "https://www.bjj.international").href
        profiles.set(url, { url, city })
      }
    } catch { /* Directory outages only reduce discovery for this run. */ }
  }
  const websites = new Set<string>()
  const prospects: Prospect[] = []
  const profileRows = [...profiles.values()].slice(0, 24)
  const profileDeadlineMs = Math.min(60000, budgetMs * 0.3)
  for (let offset = 0; offset < profileRows.length; offset += 4) {
    if (Date.now() - started > profileDeadlineMs) break
    const batch = await Promise.all(profileRows.slice(offset, offset + 4).map(async profile => {
      try {
        const page = load(await fetchPublic(profile.url))
        const body = page("body").text()
        const profileText = normalize(body)
        const nome = page("h1").first().text().trim() || page("title").text().split(/[|–—]/)[0].trim()
        const emailContacts = [...new Set(emails(body + " " + page("a[href^='mailto:']").map((_, a) => page(a).attr("href")).get().join(" ")))]
          .filter(email => !/noreply|no-reply|example|exemplo|privacidade|privacy|lgpd|dpo/i.test(email))
        const cityName = normalize(profile.city.name)
        const locationConfirmed = profileText.includes(cityName) && profileText.includes(profile.city.uf.toLowerCase())
        if (!nome || emailContacts.length !== 1 || !locationConfirmed || !/certificada/.test(profileText) || excludedBrand.test(normalize(`${nome} ${body}`))) return null
        const contact = emailContacts[0]
        const personalization = `o perfil público da CBJJE lista ${nome} como academia certificada em ${profile.city.name}, ${profile.city.uf}`
        const prospect: Prospect = {
          nome, email: contact, cidade: profile.city.name, estado: profile.city.uf,
          populacao: profile.city.population, populationSource: populationSource(profile.city),
          source: profile.url, checkedAt: new Date().toISOString().slice(0, 10), independent: true,
          qualification: "Perfil público individual da CBJJE confirma a escola, cidade, certificação e email publicado. Marcas de rede conhecidas foram excluídas; operação local/independência é inferida e o número de alunos não é informado pela fonte.",
          personalization, personalizationSource: profile.url,
          personalizedQuestion: "Como vocês acompanham frequência e graduação dos alunos nessa academia?",
        }
        const siteLinks: string[] = []
        for (const anchor of page("a[href]").toArray()) {
          try {
            const target = new URL(page(anchor).attr("href") || "")
            if (target.protocol !== "https:" || target.hostname.endsWith("bjj.international") || directories.test(target.hostname) || excludedBrand.test(normalize(target.hostname))) continue
            siteLinks.push(target.href)
          } catch { /* Invalid or relative profile links are not website seeds. */ }
        }
        return { prospect, siteLinks }
      } catch { return null }
    }))
    for (const row of batch) {
      if (!row) continue
      prospects.push(row.prospect)
      for (const url of row.siteLinks) websites.add(url)
    }
  }
  return { cities: [...found.values()], websites: [...websites], prospects }
}
export async function discover(cursor: number, blocked: Set<string>, budgetMs = 110000, progress?: (found: Prospect[], cursor: number) => Promise<void>) {
  const started = Date.now(); const municipality = await cities(); const found: Prospect[] = []; const errors: string[] = []
  if (municipality[0]?.evidence === "verified_snapshot") errors.push("ibge_live_unavailable_using_verified_snapshot")
  try { found.push(...registryProspects(await fetchPublic(REGISTRY), municipality).filter(p => !blocked.has(p.email))) } catch { errors.push("registry_unavailable") }
  await progress?.(found, cursor)
  let searched = 0; const targets = municipality.filter(c => c.population >= 20000)
  let certifiedCities: City[] = []; let certifiedWebsites: string[] = []
  try {
    const directory = await certifiedAcademyDirectory(municipality, started, budgetMs, cursor)
    certifiedCities = directory.cities; certifiedWebsites = directory.websites
    found.push(...directory.prospects.filter(p => !blocked.has(p.email) && !found.some(x => x.email === p.email || normalize(x.nome) === normalize(p.nome) && normalize(x.cidade) === normalize(p.cidade))))
  } catch { errors.push("cbjje_directory_unavailable") }
  let seeds: string[] = []
  try { seeds = await websiteSeeds() } catch { errors.push("website_directory_unavailable") }
  seeds = [...new Set([...certifiedWebsites, ...seeds])]
  // Rotate over current first-party websites, confirming all facts again on every visit.
  let inspected = 0
  while (inspected < Math.min(8, seeds.length) && Date.now() - started < budgetMs * 0.4) {
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
  while (searched < 96 && Date.now() - started < budgetMs && found.length < 100) {
    const index = searched++
    const c = index < certifiedCities.length ? certifiedCities[index] : targets[(cursor + index - certifiedCities.length) % targets.length]
    try {
      const query = `academia jiu jitsu "${c.name}" "${c.uf}" contato email -gracie -alliance -checkmat`
      const html = await fetchPublic(`https://www.bing.com/search?format=rss&cc=br&setmkt=pt-BR&q=${encodeURIComponent(query)}`)
      const $ = load(html, { xml: true })
      const links = $("item").map((_, item) => $(item).find("link").first().text().trim()).get()
        .filter(u => { try { return u.startsWith("https://") && !directories.test(new URL(u).hostname) } catch { return false } })
        .slice(0, 6)
      if (!$("item").length) errors.push(`search_no_results:${c.code}`)
      for (const url of links) { if (Date.now() - started > budgetMs) break; try { const p = siteProspect(await fetchPublic(url), url, c); if (p && !blocked.has(p.email) && !found.some(x => x.email === p.email)) found.push(p) } catch { /* Offline sources remain unqualified. */ } }
    } catch (error) { errors.push(`search_failed:${c.code}:${error instanceof Error ? error.message : "unknown"}`) }
    await progress?.(found, (cursor + searched) % targets.length)
  }
  return { found, cursor: (cursor + searched) % targets.length, searched, errors }
}

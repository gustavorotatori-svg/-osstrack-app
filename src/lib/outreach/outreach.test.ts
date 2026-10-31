import { beforeEach, describe, expect, it, vi } from "vitest"
import { brasiliaDay, qualified, type Prospect } from "./policy"
import { publicAddress, registryProspects, siteProspect, type City } from "./discovery"

const city: City = { name: "Imperatriz", uf: "MA", population: 286383, code: "2105302", year: 2026 }
const prospect: Prospect = { nome: "Wolf Jiu-Jitsu", email: "contato@wolf.com.br", cidade: city.name, estado: city.uf, populacao: city.population, populationSource: "https://www.ibge.gov.br/cidades-e-estados/ma/imperatriz.html", source: "https://wolf.com.br", checkedAt: "2026-10-31", independent: true, qualification: "Fonte própria" }
describe("outreach qualification", () => {
  it("uses the Brasília date rather than UTC midnight", () => {
    expect(brasiliaDay(new Date("2026-10-31T02:59:59Z")).day).toBe("2026-10-30")
    expect(brasiliaDay(new Date("2026-10-31T03:00:00Z")).start.toISOString()).toBe("2026-10-31T03:00:00.000Z")
  })
  it("rejects large cities, old evidence, franchises, disabled and future records", () => {
    const now = Date.parse("2026-10-31T15:00:00Z")
    expect(qualified(prospect, now)).toBe(true)
    for (const patch of [{ populacao: 500000 }, { checkedAt: "2026-09-01" }, { checkedAt: "2027-01-01" }, { nome: "Gracie Barra" }, { independent: false }, { disabledReason: "no_mx" }]) expect(qualified({ ...prospect, ...patch }, now)).toBeFalsy()
  })
  it("does not attach a franchise's email to the preceding school", () => {
    const html = `<h4>Wolf Jiu-Jitsu</h4><h4>ADDRESS</h4><p>Brazil</p><p>Imperatriz MA</p><h4>Gracie Barra</h4><h4>ADDRESS</h4><p>Brazil Imperatriz MA email: gracie@example.com</p>`
    expect(registryProspects(html, [city])).toEqual([])
  })
  it("requires an unambiguous municipality, UF and single contact", () => {
    const html = `<h4>Wolf Jiu-Jitsu</h4><h4>ADDRESS</h4><p>Brazil</p><p>Imperatriz MA</p><p>Email: contato@wolf.com.br</p>`
    expect(registryProspects(html, [city])[0].email).toBe(prospect.email)
    expect(registryProspects(html.replace("Imperatriz MA", "Imperatriz"), [city])).toEqual([])
    expect(registryProspects(html.replace("</p>", " and another@example.com</p>"), [city])).toEqual([])
  })
  it("requires first-party commercial contact and rejects generic agency emails", () => {
    const html = `<title>Wolf Jiu Jitsu</title><h1>Wolf Jiu Jitsu</h1><p>Jiu-jitsu adulto. Rua Nove, Imperatriz MA</p><a href="mailto:contato@wolf.com.br">Email</a>`
    expect(siteProspect(html, prospect.source, city)?.email).toBe(prospect.email)
    expect(siteProspect(html.replaceAll(prospect.email, "webdesigner@agency.com"), prospect.source, city)).toBeNull()
    expect(siteProspect(html + " Franquia Gracie Barra", prospect.source, city)).toBeNull()
  })
  it("rejects loopback, private, link local and NAT64 private destinations", () => {
    for (const ip of ["127.0.0.1", "10.0.0.1", "172.16.0.1", "192.168.1.1", "169.254.169.254", "::1", "::ffff:127.0.0.1", "64:ff9b::7f00:1"]) expect(publicAddress(ip)).toBe(false)
    expect(publicAddress("170.84.40.178")).toBe(true)
    expect(publicAddress("64:ff9b::aa54:28b2")).toBe(true)
  })
})

const mock = vi.hoisted(() => ({
  prisma: { relatorioEnvio: { findUnique: vi.fn(), findFirst: vi.fn() }, outreachSent: { findMany: vi.fn() }, usuario: { findMany: vi.fn() }, autoReplyLog: { findMany: vi.fn() }, $transaction: vi.fn() },
  smtp: vi.fn(),
}))
vi.mock("@/lib/prisma", () => ({ default: mock.prisma }))
vi.mock("nodemailer", () => ({ default: { createTransport: mock.smtp } }))
import { cronAuthorized, outreachStatus, runOutreach } from "./service"
describe("outreach execution guards", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("CRON_SECRET", "test-cron-secret"); vi.stubEnv("OUTREACH_ENABLED", "true"); vi.stubEnv("VERCEL_ENV", "production") })
  it("requires the actual cron secret and never accepts a public request", () => {
    expect(cronAuthorized(new Request("https://example.com"))).toBe(false)
    expect(cronAuthorized(new Request("https://example.com", { headers: { authorization: "Bearer wrong" } }))).toBe(false)
    expect(cronAuthorized(new Request("https://example.com", { headers: { authorization: "Bearer test-cron-secret" } }))).toBe(true)
  })
  it("does not send or touch production DB when disabled or in preview", async () => {
    vi.stubEnv("VERCEL_ENV", "preview")
    expect(await runOutreach("send")).toEqual({ disabled: true })
    expect(mock.prisma.$transaction).not.toHaveBeenCalled()
    expect(mock.smtp).not.toHaveBeenCalled()
  })
  it("does not steal an active run lease", async () => {
    const tx = { $queryRaw: vi.fn(), relatorioEnvio: { findUnique: vi.fn().mockResolvedValue({ dados: { leads: [], cursor: 0, lease: { token: "other-worker", until: Date.now() + 60000 } } }) } }
    mock.prisma.$transaction.mockImplementation(async fn => fn(tx))
    expect(await runOutreach("send")).toEqual({ busy: true })
    expect(mock.smtp).not.toHaveBeenCalled()
  })
  it("counts ambiguous reservations separately from confirmed acceptance", async () => {
    mock.prisma.relatorioEnvio.findUnique.mockResolvedValue(null)
    mock.prisma.relatorioEnvio.findFirst.mockResolvedValue(null)
    mock.prisma.outreachSent.findMany.mockImplementation(async (args) => args.where ? [{ bounceReason: null }, { bounceReason: "LOCAL_RESERVED: crash" }, { bounceReason: "delivery bounced" }] : [])
    mock.prisma.usuario.findMany.mockResolvedValue([]); mock.prisma.autoReplyLog.findMany.mockResolvedValue([])
    expect(await outreachStatus()).toMatchObject({ accepted: 2, reservedOrAmbiguous: 1, goal: 15 })
    expect(mock.smtp).not.toHaveBeenCalled()
  })
})

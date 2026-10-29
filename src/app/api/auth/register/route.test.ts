import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => {
  const tx = {
    academia: { create: vi.fn() },
    usuario: { create: vi.fn(), update: vi.fn(), findFirst: vi.fn() },
    notificacao: { create: vi.fn() }, graduacao: { create: vi.fn() },
    convite: { findUnique: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
  }
  return { tx, findUnique: vi.fn(), update: vi.fn(), transaction: vi.fn() }
})
vi.mock("@/lib/prisma", () => ({ default: { usuario: { findUnique: mocks.findUnique, update: mocks.update }, $transaction: mocks.transaction } }))
vi.mock("bcryptjs", () => ({ default: { hash: vi.fn().mockResolvedValue("hashed") } }))
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }), getClientIp: () => "test" }))
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn().mockResolvedValue({ sent: true }), renderEmailLayout: () => "test" }))
vi.mock("@/lib/notificar", () => ({ notificarUsuario: vi.fn().mockResolvedValue(null) }))
vi.mock("@/lib/cpf-crypto", () => ({ encryptCpf: () => "encrypted-test" }))
import { POST } from "./route"

const base = { nome: "Teste", email: "isolated@example.com", senha: "Isolated123", dataNascimento: "1990-01-01", aceitouTermos: true, aceitouLGPD: true }
const request = (body: object) => new Request("https://osstrack.com.br/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })

describe("registration permissions (mocked services; no live database or email)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "")
    mocks.findUnique.mockResolvedValue(null)
    mocks.tx.academia.create.mockResolvedValue({ id: "new-academy" })
    mocks.tx.usuario.create.mockResolvedValue({ id: "new-user" })
    mocks.tx.usuario.findFirst.mockResolvedValue({ id: "owner" })
    mocks.tx.convite.findUnique.mockResolvedValue(null)
    mocks.transaction.mockImplementation(async fn => fn(mocks.tx))
  })
  it("creating an owner cannot transfer an existing user via professorId", async () => {
    const response = await POST(request({ ...base, role: "dono", academia: { nome: "Nova" }, professorId: "victim" }))
    expect(response.status).toBe(200)
    expect(mocks.tx.usuario.update).not.toHaveBeenCalled()
    expect(mocks.update).not.toHaveBeenCalled()
  })
  it("a professor selecting an academy receives no membership until owner approval", async () => {
    const response = await POST(request({ ...base, role: "professor", academiaId: "target-academy" }))
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ approvalPending: true })
    expect(mocks.tx.usuario.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ academiaId: null }) }))
    expect(mocks.tx.notificacao.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ usuarioId: "owner", tipo: "solicitacao_professor" }) }))
  })
  it("an invalid professor invitation cannot create an account or grant access", async () => {
    const response = await POST(request({ ...base, role: "professor", academiaId: "target-academy", codigoConvite: "invalid" }))
    expect(response.status).toBe(403)
    expect(mocks.tx.usuario.create).not.toHaveBeenCalled()
    expect(mocks.tx.academia.create).not.toHaveBeenCalled()
  })
})

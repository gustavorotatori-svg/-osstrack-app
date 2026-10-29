import { describe, it, expect, vi } from "vitest"
import type { Prisma } from "@prisma/client"
import { resolveProfessorAccess } from "./registration-access"

function fixture(overrides = {}) {
  const invite = { id: "invite", tipo: "professor", usado: false, academiaId: "academy", email: null,
    expiresAt: new Date(Date.now() + 60000), remetente: { role: "dono", academiaId: "academy" }, ...overrides }
  const db = { convite: { findUnique: vi.fn().mockResolvedValue(invite), updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
    usuario: { findFirst: vi.fn().mockResolvedValue({ id: "owner" }) } }
  return { db, tx: db as unknown as Prisma.TransactionClient }
}

describe("professor academy access", () => {
  it("requests owner approval without granting access when a public academy ID is supplied", async () => {
    const { tx, db } = fixture()
    expect(await resolveProfessorAccess(tx, { academiaId: "academy", email: "teacher@example.com" }))
      .toEqual({ academiaId: null, approvalOwnerId: "owner" })
    expect(db.convite.updateMany).not.toHaveBeenCalled()
  })
  it("accepts and atomically consumes a valid invitation issued by the academy owner", async () => {
    const { tx, db } = fixture()
    expect(await resolveProfessorAccess(tx, { codigoConvite: "secret", email: "teacher@example.com" }))
      .toEqual({ academiaId: "academy", approvalOwnerId: null })
    expect(db.convite.updateMany).toHaveBeenCalledOnce()
  })
  it.each([
    { usado: true }, { expiresAt: new Date(0) }, { tipo: "aluno" },
    { remetente: { role: "aluno", academiaId: "academy" } },
    { remetente: { role: "dono", academiaId: "another-academy" } },
    { email: "another-person@example.com" },
  ])("rejects invalid, expired, mismatched and unauthorized invitations: %j", async overrides => {
    const { tx, db } = fixture(overrides)
    await expect(resolveProfessorAccess(tx, { codigoConvite: "secret", email: "teacher@example.com" })).rejects.toThrow()
    expect(db.convite.updateMany).not.toHaveBeenCalled()
  })
  it("rejects using an invitation to join a different academy", async () => {
    const { tx } = fixture()
    await expect(resolveProfessorAccess(tx, { academiaId: "other", codigoConvite: "secret", email: "teacher@example.com" })).rejects.toThrow()
  })
  it("rejects a concurrently consumed invitation", async () => {
    const { tx, db } = fixture()
    db.convite.updateMany.mockResolvedValue({ count: 0 })
    await expect(resolveProfessorAccess(tx, { codigoConvite: "secret", email: "teacher@example.com" })).rejects.toThrow()
  })
})

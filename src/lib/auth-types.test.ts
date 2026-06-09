import { describe, it, expect } from "vitest"
import { isUserRole, isUserPlano } from "./auth-types"

describe("isUserRole", () => {
  it("returns true for valid roles", () => {
    expect(isUserRole("aluno")).toBe(true)
    expect(isUserRole("professor")).toBe(true)
    expect(isUserRole("dono")).toBe(true)
  })

  it("returns false for invalid roles", () => {
    expect(isUserRole("admin")).toBe(false)
    expect(isUserRole("")).toBe(false)
    expect(isUserRole("aluno ")).toBe(false)
  })
})

describe("isUserPlano", () => {
  it("returns true for valid planos", () => {
    expect(isUserPlano("free")).toBe(true)
    expect(isUserPlano("trial")).toBe(true)
    expect(isUserPlano("premium")).toBe(true)
  })

  it("returns false for invalid planos", () => {
    expect(isUserPlano("pro")).toBe(false)
    expect(isUserPlano("")).toBe(false)
  })
})

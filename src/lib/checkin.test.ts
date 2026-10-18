import { describe, it, expect } from "vitest"
import { haversineDistance } from "./geo"
import { checkinCodigoSchema, presencaSchema } from "./validation"

describe("haversineDistance", () => {
  it("returns 0 for same point", () => {
    expect(haversineDistance(-8.0476, -34.877, -8.0476, -34.877)).toBe(0)
  })

  it("calculates ~1km for 0.009 degree lat difference", () => {
    const d = haversineDistance(-8.0476, -34.877, -8.0386, -34.877)
    expect(d).toBeGreaterThan(900)
    expect(d).toBeLessThan(1100)
  })

  it("returns correct distance between Recife and São Paulo", () => {
    const d = haversineDistance(-8.0476, -34.877, -23.5505, -46.6333)
    expect(d).toBeGreaterThan(2000000)
    expect(d).toBeLessThan(2300000)
  })
})

describe("checkinCodigoSchema", () => {
  it("accepts valid 4-digit code", () => {
    expect(checkinCodigoSchema.safeParse({ codigo: "1234" }).success).toBe(true)
  })

  it("rejects empty code", () => {
    expect(checkinCodigoSchema.safeParse({ codigo: "" }).success).toBe(false)
  })

  it("rejects missing code", () => {
    expect(checkinCodigoSchema.safeParse({}).success).toBe(false)
  })

  it("rejects code longer than 20 chars", () => {
    expect(checkinCodigoSchema.safeParse({ codigo: "a".repeat(21) }).success).toBe(false)
  })
})

describe("presencaSchema", () => {
  it("accepts valid coordinates", () => {
    expect(presencaSchema.safeParse({ latitude: -8.0476, longitude: -34.877 }).success).toBe(true)
  })

  it("rejects latitude out of range", () => {
    expect(presencaSchema.safeParse({ latitude: 91, longitude: 0 }).success).toBe(false)
  })

  it("rejects longitude out of range", () => {
    expect(presencaSchema.safeParse({ latitude: 0, longitude: 181 }).success).toBe(false)
  })

  it("rejects missing coordinates", () => {
    expect(presencaSchema.safeParse({}).success).toBe(false)
  })

  it("rejects non-number coordinates", () => {
    expect(presencaSchema.safeParse({ latitude: "abc", longitude: "def" }).success).toBe(false)
  })
})

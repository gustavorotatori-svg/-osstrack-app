import { describe, it, expect } from "vitest"
import { handleApiError } from "./api-error"

describe("handleApiError", () => {
  it("returns 500 for generic errors", () => {
    const res = handleApiError(new Error("something broke"))
    expect(res.status).toBe(500)
  })

  it("returns 409 for P2002 (duplicate)", () => {
    const res = handleApiError({ code: "P2002" })
    expect(res.status).toBe(409)
  })

  it("returns 404 for P2025 (not found)", () => {
    const res = handleApiError({ code: "P2025" })
    expect(res.status).toBe(404)
  })

  it("returns 400 for P2003 (relation)", () => {
    const res = handleApiError({ code: "P2003" })
    expect(res.status).toBe(400)
  })
})

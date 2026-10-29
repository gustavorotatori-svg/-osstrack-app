import { describe, it, expect, vi } from "vitest"
import { NextRequest, type NextFetchEvent } from "next/server"
vi.mock("next-auth/jwt", () => ({ getToken: vi.fn().mockResolvedValue(null) }))
import { proxy } from "./proxy"

describe("anonymous route boundaries", () => {
  const event = { waitUntil: vi.fn() } as unknown as NextFetchEvent
  it.each(["/api/cron/outreach/click?id=missing", "/api/cron/outreach/open?id=missing", "/api/track/view"])("allows public conversion/analytics endpoint %s", async path => {
    const result = await proxy(new NextRequest(`https://osstrack.com.br${path}`), event)
    expect(result.headers.get("x-middleware-next")).toBe("1")
  })
  it.each(["/api/cron/outreach", "/api/cron/auto-reply", "/api/turmas", "/api/cron/outreach/click/private"])("retains authentication for %s", async path => {
    const result = await proxy(new NextRequest(`https://osstrack.com.br${path}`), event)
    expect(result.status).toBe(401)
  })
})

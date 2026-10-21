import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

const TRACKED_PATHS = new Set(["/", "/cadastro", "/login", "/precos", "/funcionalidades", "/ajuda"])

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (TRACKED_PATHS.has(pathname)) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown"
    const userAgent = req.headers.get("user-agent") || "unknown"
    fetch(`${req.nextUrl.origin}/api/track/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, ip, userAgent }),
      keepalive: true,
    }).catch(() => {})
  }

  const publicPaths = [
    "/", "/login", "/cadastro", "/convite",
    "/ajuda", "/lgpd", "/termos",
    "/api/auth", "/api/academias", "/api/leads", "/api/professores", "/api/health", "/ebook", "/horarios",
    "/recuperar-senha", "/redefinir-senha", "/email-confirmado",
    "/sitemap.xml", "/robots.txt",
    "/manifest.webmanifest", "/screenshot",
    "/opengraph-image",
    "/api/erro", "/api/webhook",
  ]
  if (
    publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/og.svg") ||
    pathname === "/apple-touch-icon.png"
  ) {
    return NextResponse.next()
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  })
  const isAuthenticated = !!token

  if (pathname.startsWith("/api")) {
    const isCronPath =
      pathname.startsWith("/api/cron") ||
      pathname === "/api/aniversario/notificar" ||
      pathname === "/api/mestredomes"
    const isCronAuthorized =
      !!process.env.CRON_SECRET &&
      req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
    if (!isAuthenticated && !(isCronPath && isCronAuthorized)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    return NextResponse.next()
  }

  if (!isAuthenticated) {
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
      const url = new URL("/login", req.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  const role = token!.role as string | undefined

  if (pathname.startsWith("/dashboard")) {
    const segments = pathname.split("/")
    const targetRole = segments[2]

    if (targetRole && targetRole !== role) {
      const url = new URL(`/dashboard/${role}`, req.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|gif|svg|webp|ico|avif|webmanifest|css|js|json|txt|xml|woff2?|ttf|eot|map|pdf|mp4|webm)$).*)",
  ],
}

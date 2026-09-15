import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import prisma from "./prisma"
import type { UserRole } from "./auth-types"

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (secret) {
    if (secret.length < 32) {
      console.error("[SECURITY] NEXTAUTH_SECRET should be at least 32 characters for cryptographic strength")
    }
    return secret
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXTAUTH_SECRET é obrigatório em produção")
  }
  return crypto.randomBytes(32).toString("hex")
}

export const authOptions: NextAuthOptions = {
  secret: getSecret(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { prompt: "select_account" } },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        // Simple IP-based rate limiting for login
        const ip = req?.headers?.["x-forwarded-for"]?.split(",")?.[0]?.trim() || req?.headers?.["x-real-ip"] || "127.0.0.1"
        
        const { checkRateLimit } = await import("@/lib/rate-limit")

        const ipCheck = await checkRateLimit(`ip:${ip}`, "login")
        if (!ipCheck.allowed) {
          throw new Error("Muitas tentativas de login. Tente novamente em 1 minuto.")
        }

        const emailCheck = await checkRateLimit(`email:${credentials.email}`, "login")
        if (!emailCheck.allowed) {
          throw new Error("Muitas tentativas para este e-mail. Tente novamente em 1 minuto.")
        }

        // Verify recaptcha for login if configured
        if (process.env.RECAPTCHA_SECRET_KEY) {
          const recaptchaToken = (credentials as any).recaptchaToken
          if (!recaptchaToken) {
            throw new Error("reCAPTCHA é obrigatório")
          }
          const params = new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY, response: recaptchaToken })
          const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", { method: "POST", body: params })
          const verifyData = await verifyRes.json()
          if (!verifyData.success || (verifyData.score && verifyData.score < 0.5)) {
            throw new Error("Falha na verificação de segurança. Tente novamente.")
          }
        }

        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email },
          include: { academia: { select: { nome: true } } },
        })

        if (!user) return null
        if (!user.senha) return null

        const valid = await bcrypt.compare(credentials.password, user.senha)
        if (!valid) return null

        // Server-side email verification enforcement
        if (process.env.SMTP_HOST && process.env.SMTP_USER && !user.emailVerified) {
          throw new Error("E-mail não verificado. Verifique sua caixa de entrada.")
        }

        return {
          id: user.id,
          email: user.email,
          nome: user.nome,
          role: user.role as UserRole,
          faixa: user.faixa,
          grau: user.grau,
          academiaId: user.academiaId,
          academiaNome: user.academia?.nome || null,
          authVersion: user.authVersion,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true

      const existingUser = await prisma.usuario.findUnique({
        where: { email: user.email! },
        include: { academia: { select: { nome: true } } },
      })

      if (existingUser) {
        user.id = existingUser.id
        ;(user as any).role = existingUser.role
        ;(user as any).faixa = existingUser.faixa
        ;(user as any).grau = existingUser.grau
        ;(user as any).academiaId = existingUser.academiaId
        ;(user as any).academiaNome = existingUser.academia?.nome || null
        ;(user as any).authVersion = existingUser.authVersion
        return true
      }

      // LGPD: não criar conta via Google sem consentimento explícito.
      // O cadastro completo (que exige aceite de Termos/LGPD e maioridade)
      // só acontece pelo fluxo de credenciais.
      return false
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as UserRole
        token.faixa = user.faixa
        token.grau = user.grau
        token.academiaId = user.academiaId
        token.academiaNome = (user as any).academiaNome || null
        token.id = user.id
        token.authVersion = user.authVersion ?? 0
      }

      if (token.authVersion !== undefined && token.id) {
        const dbUser = await prisma.usuario
          .findUnique({ where: { id: token.id as string }, select: { authVersion: true } })
          .catch(() => null)
        if (dbUser && dbUser.authVersion !== token.authVersion) {
          throw new Error("Sessão revogada")
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole
        session.user.faixa = token.faixa as string
        session.user.grau = token.grau as number
        session.user.academiaId = token.academiaId ?? ""
        session.user.academiaNome = token.academiaNome as string | null
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  events: {
    async signOut({ token }) {
      const userId = (token as any)?.id || (token as any)?.sub
      if (!userId) return
      await prisma.usuario
        .update({ where: { id: userId as string }, data: { authVersion: { increment: 1 } } })
        .catch(() => {})
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // absolute: 24h
    updateAge: 12 * 60 * 60, // rolling refresh: re-signs on activity, max once every 12h
  },
  jwt: {
    maxAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.callback-url" : "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === "production" ? "__Host-next-auth.csrf-token" : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
}

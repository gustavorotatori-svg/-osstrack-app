import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import prisma from "./prisma"
import type { UserRole } from "./auth-types"

function getSecret(): string {
  if (process.env.NEXTAUTH_SECRET) return process.env.NEXTAUTH_SECRET
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXTAUTH_SECRET é obrigatório em produção")
  }
  return crypto.randomBytes(32).toString("hex")
}

export const authOptions: NextAuthOptions = {
  secret: getSecret(),
  providers: [
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
          const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
          const verifyRes = await fetch(verifyUrl, { method: "POST" })
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

        const valid = await bcrypt.compare(credentials.password, user.senha)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          nome: user.nome,
          role: user.role as UserRole,
          faixa: user.faixa,
          grau: user.grau,
          academiaId: user.academiaId,
          academiaNome: user.academia?.nome || null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as UserRole
        token.faixa = user.faixa
        token.grau = user.grau
        token.academiaId = user.academiaId
        token.academiaNome = (user as any).academiaNome || null
        token.id = user.id
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
  session: {
    strategy: "jwt",
  },
}

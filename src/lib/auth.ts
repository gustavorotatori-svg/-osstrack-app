import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import prisma from "./prisma"

function getSecret(): string {
  if (process.env.NEXTAUTH_SECRET) return process.env.NEXTAUTH_SECRET
  const stable = "osstrack-" + process.env.VERCEL_URL + "-production-secret"
  return crypto.createHash("sha256").update(stable).digest("hex")
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

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
          role: user.role,
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
        token.role = user.role
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
        session.user.role = token.role as string
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

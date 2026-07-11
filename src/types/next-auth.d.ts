import "next-auth"
import type { UserRole } from "@/lib/auth-types"

declare module "next-auth" {
  interface User {
    role?: UserRole
    faixa?: string
    grau?: number
    academiaId?: string | null
    academiaNome?: string | null
  }
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      faixa: string
      grau: number
      academiaId: string
      academiaNome: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole
    faixa?: string
    grau?: number
    academiaId?: string | null
    academiaNome?: string | null
  }
}

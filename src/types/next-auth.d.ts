import "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    faixa?: string
    grau?: number
    academiaId?: string
  }
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      faixa: string
      grau: number
      academiaId: string
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    faixa?: string
    grau?: number
    academiaId?: string
  }
}

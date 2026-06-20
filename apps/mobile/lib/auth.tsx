import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { api } from "@/lib/shared"
import { saveToken, getToken, deleteToken, saveUser, getUser, clearAuth } from "./storage"
import { router } from "expo-router"

type User = {
  id: string
  nome: string
  email: string
  role: "dono" | "professor" | "aluno"
  faixa: string
  grau: number
  avatar: string | null
  academiaId: string | null
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, senha: string) => Promise<string | null>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    restoreSession()
  }, [])

  async function restoreSession() {
    try {
      const token = await getToken()
      if (token) {
        api.setToken(token)
        const saved = await getUser()
        if (saved) {
          setUser(saved)
          // Refresh user data from API
          const res = await api.getPerfil()
          if (res.ok && res.data) {
            setUser(res.data as User)
            await saveUser(res.data)
          }
        }
      }
    } catch {
      await clearAuth()
    } finally {
      setLoading(false)
    }
  }

  const login = useCallback(async (email: string, senha: string): Promise<string | null> => {
    const res = await api.login(email, senha)
    if (!res.ok) return res.error || "Erro ao fazer login"
    if (res.data?.token) {
      await saveToken(res.data.token)
      api.setToken(res.data.token)
      const userData = res.data.user as User
      setUser(userData)
      await saveUser(userData)
    }
    return null
  }, [])

  const logout = useCallback(async () => {
    api.setToken(null)
    await clearAuth()
    setUser(null)
    router.replace("/login")
  }, [])

  const refreshUser = useCallback(async () => {
    const res = await api.getPerfil()
    if (res.ok && res.data) {
      setUser(res.data as User)
      await saveUser(res.data)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

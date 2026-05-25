"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Login() {
  const [email, setEmail] = useState("rafael@email.com")
  const [password, setPassword] = useState("123456")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("E-mail ou senha inválidos")
        setLoading(false)
        return
      }

      router.push("/dashboard")
    } catch {
      setError("Erro de conexão. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-[var(--gold)]/4 rounded-full blur-3xl" />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="w-14 h-14 gradient-gold rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">
            🥋
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">OssTrack</h1>
          <p className="text-sm text-[var(--white-muted)] mt-1.5">Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[var(--dark-card)] to-black/60 border border-[var(--dark-border)] rounded-2xl p-7 space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-premium"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5 tracking-wide">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-premium"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-3.5 text-sm"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-center text-xs text-[var(--white-muted)]">
            Ainda não tem conta?{" "}
            <Link href="/cadastro" className="text-[var(--gold)] font-semibold hover:text-[var(--gold-light)] transition-colors">
              Cadastre-se
            </Link>
          </p>

          <div className="text-center text-[10px] text-[var(--gray)] leading-relaxed pt-1 border-t border-[var(--dark-border)]">
            Contas demo: rafael@email.com / carlos@email.com / leandro@email.com
          </div>
        </form>
      </div>
    </div>
  )
}

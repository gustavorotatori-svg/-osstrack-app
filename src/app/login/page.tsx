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
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🥋</div>
          <h1 className="text-2xl font-extrabold">OssTrack</h1>
          <p className="text-sm text-[var(--white-muted)] mt-1">Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-7 space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm focus:border-[var(--gold)] focus:ring-2 focus:ring-[rgba(201,168,76,0.15)] outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm focus:border-[var(--gold)] focus:ring-2 focus:ring-[rgba(201,168,76,0.15)] outline-none transition-all"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg font-bold gradient-gold text-black transition-all disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-center text-xs text-[var(--white-muted)]">
            Ainda não tem conta?{" "}
            <Link href="/cadastro" className="text-[var(--gold)] font-semibold">
              Cadastre-se
            </Link>
          </p>

          <div className="text-center text-[10px] text-[var(--gray)] leading-relaxed">
            Contas demo: rafael@email.com / carlos@email.com / leandro@email.com<br />
            Senha: 123456
          </div>
        </form>
      </div>
    </div>
  )
}

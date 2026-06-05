"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useT } from "@/lib/use-t"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const t = useT("login")

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
        setError(t("erroCredenciais"))
        setLoading(false)
        return
      }

      router.push("/dashboard")
    } catch {
      setError(t("erroConexao"))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg"
            style={{ background: "var(--gold)", color: "#000" }}>
            🥋
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">OssTrack</h1>
          <p className="text-sm mt-1.5" style={{ color: "var(--gold)" }}>{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="surface p-7 space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("senha")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-[var(--red-dim)] border border-red-500/20 rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn w-full py-3.5 text-sm"
            style={{ background: "var(--gold)", color: "#000", fontWeight: 700 }}
          >
            {loading ? t("entrando") : t("entrar")}
          </button>

          <p className="text-center text-xs text-[var(--text-secondary)]">
            {t("semConta")}{" "}
            <Link href="/cadastro" style={{ color: "var(--gold)" }} className="font-semibold">
              {t("cadastrarSe")}
            </Link>
          </p>

          {email && password && (
            <div className="text-center text-[10px] text-[var(--text-muted)] leading-relaxed pt-1 divider">
              {t("contasDemo")}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

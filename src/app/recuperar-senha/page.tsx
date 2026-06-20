"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RecuperarSenha() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [token, setToken] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")
    setToken("")

    try {
      const res = await fetch("/api/auth/recuperar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setToken(data.token)
      setMessage("Token gerado com sucesso! Clique no link abaixo para redefinir sua senha.")
    } catch {
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,168,71,0.06)_0%,transparent_60%)]" />
      <div className="w-full max-w-sm relative z-10">
        <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors mb-6">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Voltar
        </button>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight">Recuperar senha</h1>
          <p className="text-sm mt-1.5" style={{ color: "var(--gold)" }}>Digite seu email para receber o link</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-7 space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-[var(--red-dim)] border border-red-500/20 rounded-xl px-4 py-2.5">{error}</div>
          )}

          {message && token && (
            <div className="text-sm text-emerald-500 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-2.5 space-y-2">
              <p>{message}</p>
              <Link href={`/redefinir-senha?token=${token}`}
                className="block text-center py-2 rounded-lg text-xs font-bold bg-[var(--gold)] text-black hover:brightness-110 transition-all">
                Redefinir minha senha
              </Link>
            </div>
          )}

          {!token && (
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
              style={{ background: "var(--gold)", color: "#000", fontWeight: 700 }}>
              {loading ? "Enviando..." : "Enviar link"}
            </button>
          )}

          <p className="text-center text-xs text-[var(--text-secondary)]">
            Lembrou?{" "}
            <Link href="/login" style={{ color: "var(--gold)" }} className="font-semibold">Fazer login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function RedefinirSenha() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") || ""

  const [senha, setSenha] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (senha !== confirmar) { setError("Senhas não conferem"); setLoading(false); return }
    if (senha.length < 8) { setError("Senha deve ter no mínimo 8 caracteres"); setLoading(false); return }

    try {
      const res = await fetch("/api/auth/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, senha }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSuccess(true)
    } catch {
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center"><p className="text-[var(--text-secondary)]">Link inválido. Solicite um novo link de recuperação.</p>
          <Link href="/recuperar-senha" className="text-[var(--gold)] font-semibold text-sm mt-2 inline-block">Tentar novamente</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,168,71,0.06)_0%,transparent_60%)]" />
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight">Redefinir senha</h1>
          <p className="text-sm mt-1.5" style={{ color: "var(--gold)" }}>Escolha uma nova senha</p>
        </div>

        {success ? (
          <div className="glass-card p-7 text-center space-y-4">
            <p className="text-emerald-500 font-semibold">Senha redefinida com sucesso!</p>
            <Link href="/login"
              className="block w-full py-3.5 rounded-xl text-sm font-bold"
              style={{ background: "var(--gold)", color: "#000" }}>
              Fazer login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-7 space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">Nova senha</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={senha}
                  onChange={(e) => setSenha(e.target.value)} className="input-field w-full pr-10" required minLength={8} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors">
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">Confirmar senha</label>
              <input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)}
                className="input-field" required minLength={8} />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-[var(--red-dim)] border border-red-500/20 rounded-xl px-4 py-2.5">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
              style={{ background: "var(--gold)", color: "#000" }}>
              {loading ? "Redefinindo..." : "Redefinir senha"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

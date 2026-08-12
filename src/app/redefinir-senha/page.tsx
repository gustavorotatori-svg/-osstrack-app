"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function RedefinirSenhaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") || ""

  const [senha, setSenha] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  useEffect(() => {
    if (!token) return
    fetch(`/api/auth/validar-token-reset?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => setTokenValid(data.valid === true))
      .catch(() => setTokenValid(false))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (senha !== confirmar) { setError("Senhas não conferem"); setLoading(false); return }
    if (senha.length < 8) { setError("Senha deve ter no mínimo 8 caracteres"); setLoading(false); return }

    try {
      let recaptchaToken = ""
      if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
        try {
          const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
          if (!(window as any).grecaptcha?.ready) {
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement("script")
              script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
              script.onload = () => { (window as any).grecaptcha.ready(() => resolve()) }
              script.onerror = () => reject(new Error("Failed to load reCAPTCHA"))
              document.head.appendChild(script)
            })
          } else {
            await new Promise<void>((resolve) => (window as any).grecaptcha.ready(resolve))
          }
          recaptchaToken = await (window as any).grecaptcha.execute(siteKey, { action: "redefinir_senha" })
        } catch { console.warn("[redefinir-senha] reCAPTCHA error") }
      }

      const res = await fetch("/api/auth/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, senha, recaptchaToken: recaptchaToken || undefined }),
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
        <div className="w-full max-w-sm">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--gold)] bg-[var(--bg-surface)] hover:bg-[var(--border)] px-3 py-1.5 rounded-full transition-all mb-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Voltar ao login
          </Link>
          <div className="text-center"><p className="text-[var(--text-secondary)]">Link inválido. Solicite um novo link de recuperação.</p>
            <Link href="/recuperar-senha" className="text-[var(--gold)] font-semibold text-sm mt-2 inline-block">Tentar novamente</Link>
          </div>
        </div>
      </div>
    )
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-10 h-10 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[var(--text-secondary)] mt-3">Validando link...</p>
        </div>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--gold)] bg-[var(--bg-surface)] hover:bg-[var(--border)] px-3 py-1.5 rounded-full transition-all mb-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Voltar ao login
          </Link>
          <div className="text-center glass-card p-7">
            <p className="text-[var(--text-secondary)]">Link expirado ou inválido.</p>
            <Link href="/recuperar-senha" className="text-[var(--gold)] font-semibold text-sm mt-2 inline-block">Solicitar novo link</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,168,71,0.06)_0%,rgba(201,122,46,0.03)_40%,transparent_60%)]" />
      <div className="w-full max-w-sm relative z-10">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--gold)] bg-[var(--bg-surface)] hover:bg-[var(--border)] px-3 py-1.5 rounded-full transition-all mb-6">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Voltar ao login
        </Link>
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-lg relative z-10 btn-gold">
              🥋
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] animate-float"
              style={{ background: "var(--amber)", color: "#000" }}>
              🌙
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--gold)" }}>OssTrack</h1>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] mt-1" style={{ color: "var(--gold)" }}>
            The Jiu Jitsu Revolution
          </p>
          <p className="text-sm mt-1.5" style={{ color: "var(--gold)" }}>Escolha uma nova senha</p>
        </div>

        {success ? (
          <div className="glass-card p-7 text-center space-y-4">
            <p className="text-emerald-500 font-semibold">Senha redefinida com sucesso!</p>
            <Link href="/login"
              className="block w-full py-3.5 rounded-xl text-sm font-bold btn-gold">
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
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97] btn-gold">
              {loading ? "Redefinindo..." : "Redefinir senha"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function RedefinirSenha() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg)" }} />}>
      <RedefinirSenhaContent />
    </Suspense>
  )
}

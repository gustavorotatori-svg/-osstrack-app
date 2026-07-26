"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RecuperarSenha() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

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
          recaptchaToken = await (window as any).grecaptcha.execute(siteKey, { action: "recuperar_senha" })
        } catch { console.warn("[recuperar-senha] reCAPTCHA error") }
      }

      const res = await fetch("/api/auth/recuperar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, recaptchaToken: recaptchaToken || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSent(true)
    } catch {
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,168,71,0.06)_0%,rgba(201,122,46,0.03)_40%,transparent_60%)]" />
      <div className="w-full max-w-sm relative z-10">
        <button onClick={() => router.push("/")} className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--gold)] bg-[var(--bg-surface)] hover:bg-[var(--border)] px-3 py-1.5 rounded-full transition-all mb-6">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Voltar ao início
        </button>
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-lg relative z-10"
              style={{ background: "var(--gold)", color: "#000" }}>
              🥋
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] animate-float"
              style={{ background: "var(--amber)", color: "#000" }}>
              🌙
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--gold)" }}>OssTrack</h1>
          <p className="text-sm mt-1.5" style={{ color: "var(--gold)" }}>
            {sent ? "Verifique seu e-mail" : "Digite seu email para receber o link"}
          </p>
        </div>

        <div className="glass-card p-7 space-y-4">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto" style={{ background: "var(--gold-dim)" }}>
                📧
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Se <strong className="text-[var(--text)]">{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha.
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Não encontrou? Verifique a pasta de spam.
              </p>
              <button onClick={() => setSent(false)}
                className="w-full py-3 rounded-xl text-sm font-bold btn-gold">
                Tentar com outro e-mail
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">Email</label>
                <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
              </div>

              {error && (
                <div role="alert" aria-live="assertive" className="text-sm text-red-500 bg-[var(--red-dim)] border border-red-500/20 rounded-xl px-4 py-2.5">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97] btn-gold">
                {loading ? "Enviando..." : "Enviar link"}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-[var(--text-secondary)]">
            Lembrou?{" "}
            <Link href="/login" style={{ color: "var(--gold)" }} className="font-semibold">Fazer login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

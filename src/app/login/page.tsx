"use client"

import { useState, useEffect, useCallback } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useT } from "@/lib/use-t"
import { InstallPrompt, useInstall } from "@/components/pwa/install-prompt"

type Role = "aluno" | "professor" | "dono"

const ROLE_CONFIG: Record<Role, { label: string; icon: string; color: string; gradient: string; orb: string; belt: string }> = {
  aluno: {
    label: "Aluno",
    icon: "🥋",
    color: "#3b82f6",
    gradient: "rgba(59,130,246,0.06)",
    orb: "rgba(59,130,246,0.04)",
    belt: "var(--belt-azul)",
  },
  professor: {
    label: "Professor",
    icon: "👨‍🏫",
    color: "#9333ea",
    gradient: "rgba(147,51,234,0.06)",
    orb: "rgba(147,51,234,0.04)",
    belt: "var(--belt-roxa)",
  },
  dono: {
    label: "Academia",
    icon: "🏛️",
    color: "#d4a847",
    gradient: "rgba(212,168,71,0.06)",
    orb: "rgba(212,168,71,0.04)",
    belt: "var(--belt-coral)",
  },
}

export default function Login() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<Role>("aluno")
  const t = useT("login")
  const { install, canInstall, isIOS, isStandalone } = useInstall()
  const cfg = ROLE_CONFIG[role]

  useEffect(() => {
    const r = searchParams.get("role") as Role | null
    if (r && ROLE_CONFIG[r]) setRole(r)
  }, [searchParams])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      let recaptchaToken = ""

      if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
        try {
          if (!(window as any).grecaptcha) {
            await new Promise<void>((resolve) => {
              const script = document.createElement("script")
              script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`
              script.onload = () => resolve()
              document.head.appendChild(script)
            })
          }
          recaptchaToken = await (window as any).grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, { action: "login" })
        } catch {}
      }

      const result = await signIn("credentials", {
        email,
        password,
        recaptchaToken: recaptchaToken || undefined,
        redirect: false,
      })

      if (result?.error) {
        setError(t("erroCredenciais"))
        setLoading(false)
        return
      }

      const ref = searchParams.get("ref")
      router.push(ref === "ebook" ? "/ebook/conteudo" : "/dashboard")
    } catch {
      setError(t("erroConexao"))
      setLoading(false)
    }
  }, [email, password, searchParams, router, t])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{ background: `radial-gradient(ellipse at top, ${cfg.gradient} 0%, transparent 60%)` }}
      />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] transition-all duration-700"
        style={{ background: `radial-gradient(ellipse at center, ${cfg.orb} 0%, transparent 70%)` }}
      />
      <div className="w-full max-w-sm relative z-10">
        <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:opacity-80 transition-colors mb-6">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Voltar
        </button>

        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg transition-all duration-500"
            style={{ background: cfg.color, color: "#000" }}
          >
            {cfg.icon}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight transition-colors duration-500" style={{ color: cfg.color }}>
            OssTrack
          </h1>
          <p className="text-sm mt-1.5 transition-colors duration-500" style={{ color: cfg.color }}>
            {t("subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-7 space-y-4">
          <div className="flex rounded-xl overflow-hidden border border-[var(--border)] mb-2">
            {(Object.entries(ROLE_CONFIG) as [Role, typeof cfg][]).map(([key, c]) => (
              <button
                key={key}
                type="button"
                onClick={() => setRole(key)}
                className="flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 relative"
                style={{
                  background: role === key ? `${c.color}15` : "transparent",
                  color: role === key ? c.color : "var(--text-muted)",
                }}
              >
                <span className="mr-1">{c.icon}</span>
                {c.label}
                {role === key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all duration-300"
                    style={{ background: c.color }}
                  />
                )}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              style={{ borderColor: email ? cfg.color : undefined }}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5 tracking-wide">{t("senha")}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full pr-10"
                style={{ borderColor: password ? cfg.color : undefined }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/recuperar-senha" className="text-xs transition-colors" style={{ color: "var(--text-muted)" }}>
              Esqueceu a senha?
            </Link>
          </div>

          {error && (
            <div className="text-sm bg-[var(--red-dim)] border border-red-500/20 rounded-xl px-4 py-2.5" style={{ color: "var(--red)" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
            style={{ background: cfg.color, color: "#000" }}
          >
            {loading ? t("entrando") : t("entrar")}
          </button>

          <p className="text-center text-xs text-[var(--text-secondary)]">
            {t("semConta")}{" "}
            <Link
              href={`/cadastro${role !== "aluno" ? `?tipo=${role}` : ""}`}
              className="font-semibold transition-colors"
              style={{ color: cfg.color }}
            >
              {t("cadastrarSe")}
            </Link>
          </p>
        </form>

        {!isStandalone && (
          <div className="text-center mt-6">
            <button onClick={install} className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:opacity-80 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {isIOS ? "Instalar na Tela de Início" : "Instalar App"}
            </button>
          </div>
        )}
      </div>
      <InstallPrompt />
    </div>
  )
}

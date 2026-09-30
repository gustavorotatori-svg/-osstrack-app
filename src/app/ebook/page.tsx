"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, ArrowLeft, Check, Mail } from "lucide-react"
import { useT } from "@/lib/use-t"

export default function EbookPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const t = useT("ebookLead")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) return
    setLoading(true)
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nome: "", consentimento: true }),
      })
    } catch {}
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative" style={{ background: "var(--bg)" }}>
      <Link href="/" className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-70 transition-opacity" style={{ color: "var(--text-secondary)" }}>
        <ArrowLeft className="w-3.5 h-3.5" /> {t("voltar")}
      </Link>

      <div className="glass-card p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-[rgba(212,168,71,0.12)] flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-7 h-7" style={{ color: "var(--gold)" }} />
        </div>

        <h1 className="text-lg font-extrabold mb-2">{t("titulo")}</h1>
        <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
          <strong>{t("subtitulo")}</strong>
        </p>
        <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
          {t("descricao")}
        </p>

        {!submitted ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-3 mb-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full py-3 text-sm font-bold inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
              >
                {loading ? t("enviando") : t("baixar")}
              </button>
            </form>

            <p className="text-[10px] mb-4" style={{ color: "var(--text-muted)" }}>
              {t("semSpam")}
            </p>

            <div className="border-t border-[rgba(255,255,255,0.06)] pt-4">
              <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{t("querApp")}</p>
              <Link
                href="/cadastro?ref=ebook"
                className="text-xs font-semibold hover:underline"
                style={{ color: "var(--gold)" }}
              >
                {t("criarConta")} →
              </Link>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-1">{t("enviado")}</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {t("verifique")} ({email}). {t("linkChegou")}
              </p>
            </div>
            <Link
              href="/cadastro?ref=ebook"
              className="btn-gold w-full py-3 text-sm font-bold inline-flex items-center justify-center gap-2"
            >
              {t("criarEAcessar")}
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

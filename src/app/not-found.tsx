"use client"

import Link from "next/link"
import { useT } from "@/lib/use-t"

export default function NotFound() {
  const t = useT("notFound")
  return (
    <main className="tatame-bg min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,168,71,0.06)_0%,transparent_60%)]" />
      <div className="relative z-10 text-center max-w-md mx-auto">
        <div className="w-20 h-20 gradient-gold rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 animate-float">🥋</div>
        <p className="label" style={{ color: "var(--gold)" }}>Erro 404</p>
        <h1 className="text-3xl font-extrabold tracking-tight mt-2" style={{ color: "var(--text)" }}>
          {t("titulo")}
        </h1>
        <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--white-muted)" }}>
          {t("desc")}
        </p>
        <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
          <Link href="/" className="btn-gold px-6 py-3 text-sm font-bold">{t("voltar")}</Link>
          <Link href="/cadastro"
            className="px-6 py-3 rounded-xl text-sm font-bold border border-[var(--dark-border)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all"
            style={{ color: "var(--text-secondary)" }}>
            {t("criarConta")}
          </Link>
        </div>
      </div>
    </main>
  )
}
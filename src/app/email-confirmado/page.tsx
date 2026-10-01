"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { useT } from "@/lib/use-t"

function EmailConfirmadoContent() {
  const t = useT("emailConfirmado")
  const searchParams = useSearchParams()
  const success = searchParams.get("success") === "true"
  const error = searchParams.get("error")

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,168,71,0.06)_0%,rgba(201,122,46,0.03)_40%,transparent_60%)]" />
      <div className="w-full max-w-sm relative z-10">
        <div className="glass-card p-7 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-lg btn-gold">
            {success ? "✅" : "❌"}
          </div>

          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: "var(--gold)" }}>
            {success ? t("sucesso") : t("falha")}
          </h1>

          {success ? (
            <p className="text-sm text-[var(--text-secondary)]">
              {t("confirmadoDesc")}
            </p>
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">
              {error === "expired"
                ? t("expirado")
                : t("invalido")}
            </p>
          )}

          <div className="space-y-2">
            <Link href="/login" className="block w-full py-3 rounded-xl text-sm font-bold btn-gold">
              {t("fazerLogin")}
            </Link>
            {!success && (
              <Link href="/cadastro" className="block text-xs text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
                {t("criarConta")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EmailConfirmado() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg)" }} />}>
      <EmailConfirmadoContent />
    </Suspense>
  )
}

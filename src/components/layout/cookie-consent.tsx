"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("osstrack_cookie_consent")
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem("osstrack_cookie_consent", "true")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto glass-card p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1 text-sm text-[var(--text-secondary)] leading-relaxed">
          Utilizamos cookies essenciais para autenticação e funcionamento da plataforma.{" "}
          <Link href="/lgpd" className="text-[var(--gold)] font-semibold hover:underline">
            Saiba mais
          </Link>
        </div>
        <button
          onClick={accept}
          className="px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all active:scale-[0.97]"
          style={{ background: "var(--gold)", color: "#000" }}
        >
          Aceitar
        </button>
      </div>
    </div>
  )
}

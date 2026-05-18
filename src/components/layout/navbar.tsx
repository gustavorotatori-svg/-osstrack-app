"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-5 py-4 bg-[rgba(10,10,10,0.8)] backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight">
        <span className="w-9 h-9 gradient-gold rounded-lg flex items-center justify-center text-sm text-black">
          🥋
        </span>
        OssTrack
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <Link href="/#recursos" className="text-sm text-[var(--white-muted)] hover:text-white transition-colors">
          Recursos
        </Link>
        <Link href="/#funciona" className="text-sm text-[var(--white-muted)] hover:text-white transition-colors">
          Como Funciona
        </Link>
        <Link href="/#planos" className="text-sm text-[var(--white-muted)] hover:text-white transition-colors">
          Planos
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {session ? (
          <Link
            href={`/dashboard/${session.user.role}`}
            className="px-5 py-2.5 rounded-lg font-semibold text-sm gradient-gold text-black"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-lg font-semibold text-sm border border-[var(--dark-border)] text-white hover:border-[var(--gold)] transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="px-5 py-2.5 rounded-lg font-semibold text-sm gradient-gold text-black"
            >
              Começar Grátis
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

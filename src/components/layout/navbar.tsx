"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"

export function Navbar() {
  const { data: session } = useSession()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 px-5 py-3.5 transition-all duration-300 ${
        scrolled
          ? "bg-[rgba(10,10,10,0.92)] backdrop-blur-2xl border-b border-[var(--dark-border)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-lg tracking-tight group">
          <span className="w-9 h-9 gradient-gold rounded-xl flex items-center justify-center text-sm text-black transition-transform duration-300 group-hover:scale-105">
            🥋
          </span>
          <span className="hidden sm:inline">OssTrack</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[
            { href: "/#recursos", label: "Recursos" },
            { href: "/#funciona", label: "Como Funciona" },
            { href: "/#planos", label: "Planos" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-[var(--white-muted)] hover:text-white transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1.5px] after:bg-[var(--gold)] after:transition-all hover:after:w-full"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {session ? (
            <Link
              href={`/dashboard/${session.user.role}`}
              className="btn-gold px-5 py-2.5 text-sm"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl font-semibold text-sm text-[var(--white-muted)] hover:text-white transition-colors"
              >
                Entrar
              </Link>
              <Link href="/cadastro" className="btn-gold px-5 py-2.5 text-sm">
                Começar Grátis
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

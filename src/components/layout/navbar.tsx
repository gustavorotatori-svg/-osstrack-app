"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useT } from "@/lib/use-t"
import { LocaleSwitcher } from "@/components/ui/locale-switcher"
import { DumbbellIcon } from "@/components/ui/icons"

export function Navbar() {
  const { data: session } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const t = useT("nav")

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
      <div className="max-w-6xl mx-auto flex items-center">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-base tracking-tight group w-32">
          <span className="w-8 h-8 gradient-gold rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shrink-0">
            <DumbbellIcon className="w-4 h-4 text-black" />
          </span>
          <span className="hidden sm:inline truncate">OssTrack</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
          {[
            { href: "/#recursos", label: t("recursos") },
            { href: "/#funciona", label: t("comoFunciona") },
            { href: "/#planos", label: t("planos") },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-[var(--white-muted)] hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {session ? (
            <Link
              href={`/dashboard/${session.user.role}`}
              className="btn-gold px-4 py-1.5 text-sm ml-2"
            >
              {t("dashboard")}
            </Link>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-xl font-semibold text-sm text-[var(--white-muted)] hover:text-white transition-colors"
              >
                {t("entrar")}
              </Link>
              <Link href="/cadastro" className="btn-gold px-4 py-1.5 text-sm">
                {t("cadastro")}
              </Link>
            </div>
          )}
          <div className="ml-3">
            <LocaleSwitcher />
          </div>
        </div>

        <div className="hidden md:block w-32" />

        <div className="flex items-center md:hidden gap-2">
          <LocaleSwitcher />
          {session ? (
            <Link
              href={`/dashboard/${session.user.role}`}
              className="btn-gold px-4 py-1.5 text-sm"
            >
              {t("dashboard")}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-xl font-semibold text-sm text-[var(--white-muted)] hover:text-white transition-colors"
              >
                {t("entrar")}
              </Link>
              <Link href="/cadastro" className="btn-gold px-4 py-1.5 text-sm">
                {t("cadastro")}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

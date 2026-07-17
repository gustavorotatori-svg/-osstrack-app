"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useT } from "@/lib/use-t"
import { LocaleSwitcher } from "@/components/ui/locale-switcher"
import { MobileMenu } from "@/components/landing/mobile-menu"
import { DumbbellIcon } from "@/components/ui/icons"
import { useInstall } from "@/components/pwa/install-prompt"

export function Navbar() {
  const { data: session } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const t = useT("nav")
  const { install, canInstall, isIOS, isStandalone } = useInstall()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav aria-label="Navegação principal"
      className={`fixed top-0 left-0 right-0 z-50 px-5 py-3.5 transition-all duration-300 ${
        scrolled
          ? "bg-[rgba(10,10,10,0.92)] backdrop-blur-2xl border-b border-[var(--dark-border)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center">
        <Link href="/" className="flex items-center gap-3 font-extrabold text-xl tracking-tight group shrink-0">
          <span className="w-10 h-10 gradient-gold rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shrink-0 shadow-lg shadow-[var(--gold)]/10">
            <DumbbellIcon className="w-5 h-5 text-black" />
          </span>
          <span className="hidden sm:inline text-white">OssTrack</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
          {[
            { href: "/#recursos", label: t("recursos") },
            { href: "/#funciona", label: t("comoFunciona") },
            { href: "/#gratis", label: t("gratis") },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {session ? (
            <Link
              href={`/dashboard/${session.user.role}`}
              className="btn-gold px-4 py-2 text-sm ml-2"
            >
              {t("dashboard")}
            </Link>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl font-semibold text-sm text-white/80 hover:text-white transition-colors"
              >
                {t("entrar")}
              </Link>
              <Link href="/cadastro" className="btn-gold px-4 py-2 text-sm">
                {t("cadastro")}
              </Link>
            </div>
          )}
          {!isStandalone && (canInstall || isIOS) && (
            <button onClick={install}
              className="ml-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 whitespace-nowrap"
              style={{ border: "1px solid rgba(212,168,71,0.2)", color: "var(--gold)", background: "rgba(212,168,71,0.06)" }}
            >
              + Instalar
            </button>
          )}
          <div className="ml-3">
            <LocaleSwitcher />
          </div>
        </div>

        <div className="flex items-center md:hidden gap-1">
          {!isStandalone && (canInstall || isIOS) && (
            <button onClick={install}
              className="px-3 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95"
              style={{ border: "1px solid rgba(212,168,71,0.2)", color: "var(--gold)", background: "rgba(212,168,71,0.06)" }}
            >
              + App
            </button>
          )}
          {session ? (
            <Link
              href={`/dashboard/${session.user.role}`}
              className="btn-gold px-3 py-2 text-xs"
            >
              {t("dashboard")}
            </Link>
          ) : (
            <Link href="/cadastro" className="btn-gold px-3 py-2 text-xs">
              {t("cadastro")}
            </Link>
          )}
          <MobileMenu />
        </div>
      </div>
    </nav>
  )
}

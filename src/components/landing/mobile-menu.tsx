"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useT } from "@/lib/use-t"
import { LocaleSwitcher } from "@/components/ui/locale-switcher"
import { XIcon } from "@/components/ui/icons"

export function MobileMenu() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const t = useT("nav")

  const links = [
    { href: "/#recursos", label: t("recursos") },
    { href: "/#funciona", label: t("comoFunciona") },
    { href: "/#gratis", label: t("gratis") },
  ]

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg-surface)] transition-all"
        aria-label="Menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/85 backdrop-blur-2xl" />
          <div className="relative z-10 flex flex-col h-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-12">
              <Link href="/" className="flex items-center gap-3 font-extrabold text-xl" onClick={() => setOpen(false)}>
                <span className="w-10 h-10 gradient-gold rounded-xl flex items-center justify-center" />
                <span className="text-white font-extrabold">OssTrack</span>
              </Link>
              <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-2 flex-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-lg font-bold text-white/70 hover:text-white py-3 px-4 rounded-xl hover:bg-white/10 transition-all"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="space-y-3 pt-6 border-t border-white/10">
              <LocaleSwitcher />
              {session ? (
                <Link
                  href={`/dashboard/${session.user.role}`}
                  onClick={() => setOpen(false)}
                  className="btn-gold w-full py-3.5 text-center block font-bold"
                >
                  {t("dashboard")}
                </Link>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="w-full py-3.5 rounded-xl font-semibold text-center text-white/80 border border-white/20 hover:bg-white/10 transition-all"
                  >
                    {t("entrar")}
                  </Link>
                  <Link
                    href="/cadastro"
                    onClick={() => setOpen(false)}
                    className="btn-gold w-full py-3.5 text-center block font-bold"
                  >
                    {t("cadastro")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

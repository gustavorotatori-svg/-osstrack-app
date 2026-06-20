"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useT } from "@/lib/use-t"
import { LocaleSwitcher } from "@/components/ui/locale-switcher"
import { DumbbellIcon, XIcon } from "@/components/ui/icons"

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
        className="md:hidden p-2 rounded-xl text-[var(--white-muted)] hover:text-white hover:bg-white/5 transition-all"
        aria-label="Menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
          <div className="relative z-10 flex flex-col h-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-12">
              <Link href="/" className="flex items-center gap-3 font-extrabold text-xl" onClick={() => setOpen(false)}>
                <span className="w-10 h-10 gradient-gold rounded-xl flex items-center justify-center">
                  <DumbbellIcon className="w-5 h-5 text-black" />
                </span>
                <span>OssTrack</span>
              </Link>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl text-[var(--white-muted)] hover:text-white hover:bg-white/5 transition-all">
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-2 flex-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-lg font-semibold text-[var(--white-muted)] hover:text-white py-3 px-4 rounded-xl hover:bg-white/5 transition-all"
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
                    className="w-full py-3.5 rounded-xl font-semibold text-center text-white border border-white/20 hover:bg-white/5 transition-all"
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

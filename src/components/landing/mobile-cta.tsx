"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"

export function MobileCta() {
  const { data: session } = useSession()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (session) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-500 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-[rgba(10,10,10,0.95)] backdrop-blur-2xl border-t border-[rgba(212,168,71,0.15)] px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <Link
          href="/cadastro"
          className="btn-gold w-full py-3.5 text-center block font-bold text-sm"
        >
          Começar Grátis
        </Link>
      </div>
    </div>
  )
}

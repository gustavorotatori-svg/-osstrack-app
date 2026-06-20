"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen, ArrowLeft } from "lucide-react"

export default function EbookPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/cadastro?ref=ebook")
    }, 2000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg)" }}>
      <div className="glass-card p-8 max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-[rgba(212,168,71,0.12)] flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-7 h-7" style={{ color: "var(--gold)" }} />
        </div>
        <h1 className="text-lg font-extrabold mb-2">E-book Exclusivo</h1>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          Você precisa de uma conta gratuita para baixar o e-book.
        </p>
        <Link
          href="/cadastro?ref=ebook"
          className="btn-gold w-full py-3 text-sm font-bold inline-flex items-center justify-center gap-2 mb-2 hover:scale-105 transition-transform active:scale-95"
        >
          Criar conta grátis
        </Link>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Já tem conta?{" "}
          <Link href="/login?ref=ebook" className="font-semibold" style={{ color: "var(--gold)" }}>
            Entrar
          </Link>
        </p>
        <div className="mt-4 flex items-center justify-center gap-1 text-[10px] animate-pulse" style={{ color: "var(--text-muted)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />
          Redirecionando em 2 segundos...
        </div>
      </div>
    </main>
  )
}

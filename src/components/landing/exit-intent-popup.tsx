"use client"

import { useState, useEffect, useCallback } from "react"
import { X } from "lucide-react"

export function ExitIntentPopup() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const wasDismissed = localStorage.getItem("osstrack_exit_dismissed")
    if (wasDismissed) { setDismissed(true); return }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !show && !dismissed) {
        setShow(true)
      }
    }
    document.addEventListener("mouseleave", handleMouseLeave)
    return () => document.removeEventListener("mouseleave", handleMouseLeave)
  }, [show, dismissed])

  const handleDismiss = useCallback(() => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem("osstrack_exit_dismissed", "1")
  }, [])

  useEffect(() => {
    if (!show) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [show, handleDismiss])

  if (!show || dismissed) return null

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="exit-intent-title"
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
      <div className="relative glass-card max-w-md w-full p-8 text-center border border-[rgba(212,168,71,0.2)] animate-scale-in">
        <button onClick={handleDismiss} aria-label="Fechar" className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="text-5xl mb-4">🥋</div>
        <h2 id="exit-intent-title" className="text-2xl font-extrabold text-white mb-3">Espere! Sua academia ainda precisa de você</h2>
        <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
          O OssTrack é gratuito para a academia, os professores e os alunos. Cadastre sua academia agora e comece a organizar tudo em 2 minutos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/cadastro" className="btn-primary px-6 py-3 text-sm font-bold">
            Criar Conta Grátis
          </a>
          <button onClick={handleDismiss} className="px-6 py-3 text-sm text-[var(--text-muted)] hover:text-white transition-colors">
            Agora não
          </button>
        </div>
      </div>
    </div>
  )
}

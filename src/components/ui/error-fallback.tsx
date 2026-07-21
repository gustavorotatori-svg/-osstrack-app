"use client"

import { useEffect } from "react"
import { AlertTriangleIcon } from "./icons"

export function ErrorFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-5">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangleIcon className="w-6 h-6 text-red-400" />
        </div>
        <h2 className="text-lg font-bold mb-2">Algo deu errado</h2>
        <p className="text-sm text-[var(--white-muted)] leading-relaxed mb-6">
          Não foi possível carregar esta página. Tente novamente.
        </p>
        <button
          onClick={reset}
          className="btn-gold px-6 py-3 rounded-xl font-bold text-sm"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}

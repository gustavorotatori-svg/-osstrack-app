"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>Algo deu errado</h1>
            <p style={{ color: "#a0a0a0", marginBottom: "1.5rem" }}>Erro interno. Tente novamente.</p>
            <button
              onClick={reset}
              style={{ background: "linear-gradient(135deg, #c9a84c, #f5d77b)", color: "#000", fontWeight: 700, padding: "0.75rem 2rem", borderRadius: "12px", border: "none", cursor: "pointer" }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

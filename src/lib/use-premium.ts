"use client"

import { useState, useEffect } from "react"

type PremiumStatus = {
  isPremium: boolean
  plano: "free" | "trial" | "premium"
  diasRestantes: number
  dataExpiracao: string | null
  loading: boolean
}

export function usePremium(): PremiumStatus {
  const [status, setStatus] = useState<PremiumStatus>({
    isPremium: false,
    plano: "free",
    diasRestantes: 0,
    dataExpiracao: null,
    loading: true,
  })

  useEffect(() => {
    fetch("/api/premium")
      .then((r) => r.json())
      .then((d) => {
        setStatus({
          isPremium: d.plano === "premium" || d.plano === "trial",
          plano: d.plano,
          diasRestantes: d.diasRestantes || 0,
          dataExpiracao: d.dataExpiracao || null,
          loading: false,
        })
      })
      .catch(() => setStatus((s) => ({ ...s, loading: false })))
  }, [])

  return status
}
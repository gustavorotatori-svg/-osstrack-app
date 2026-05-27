"use client"

import { useState } from "react"

type Props = {
  acao: "cobranca" | "checkin" | "lembrete" | "promocao" | "personalizado"
  alunoId: string
  alunoNome: string
  valor?: number
  dataVencimento?: string
  linkPersonalizado?: string
  label?: string
  variant?: "gold" | "ghost" | "emerald"
  size?: "sm" | "md"
}

export function WhatsAppButton({
  acao,
  alunoId,
  alunoNome,
  valor,
  dataVencimento,
  linkPersonalizado,
  label = "WhatsApp",
  variant = "emerald",
  size = "sm",
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleClick() {
    setLoading(true)
    setError("")
    try {
      const body: Record<string, unknown> = { acao, alunoId }
      if (valor !== undefined) body.valor = valor
      if (dataVencimento) body.dataVencimento = dataVencimento
      if (linkPersonalizado) body.linkPersonalizado = linkPersonalizado

      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok && data.link) {
        window.open(data.link, "_blank")
      } else {
        setError(data.error || "Erro ao gerar link")
      }
    } catch {
      setError("Erro de conexão")
    }
    setLoading(false)
  }

  const variants = {
    gold: "gradient-gold text-black",
    ghost: "border border-[var(--dark-border)] text-[var(--white-muted)] hover:border-[var(--gold)] hover:text-[var(--gold)]",
    emerald: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
  }

  const sizes = {
    sm: "text-[10px] px-3 py-1.5 rounded-lg",
    md: "text-xs px-4 py-2 rounded-xl",
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`font-semibold transition-all active:scale-95 ${variants[variant]} ${sizes[size]} inline-flex items-center gap-1.5`}
      >
        {loading ? "..." : "💬"}
        {label}
      </button>
      {error && <div className="text-[9px] text-red-400 mt-1">{error}</div>}
    </div>
  )
}

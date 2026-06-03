"use client"

import { useState } from "react"
import { useT } from "@/lib/use-t"
import { MessageIcon } from "@/components/ui/icons"

type Props = {
  acao: "checkin" | "lembrete" | "promocao" | "personalizado"
  alunoId: string
  alunoNome: string
  linkPersonalizado?: string
  label?: string
  variant?: "gold" | "ghost" | "emerald"
  size?: "sm" | "md"
}

export function WhatsAppButton({
  acao,
  alunoId,
  alunoNome,

  linkPersonalizado,
  label,
  variant = "emerald",
  size = "sm",
}: Props) {
  const t = useT("whatsappFab")
  const resolvedLabel = label || t("mensagem")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleClick() {
    setLoading(true)
    setError("")
    try {
      const body: Record<string, unknown> = { acao, alunoId }
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
        setError(data.error || t("erroGerar"))
      }
    } catch {
      setError(t("erroConexao"))
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
        {loading ? "..." : <MessageIcon className="w-3.5 h-3.5" />}
        {resolvedLabel}
      </button>
      {error && <div className="text-[9px] text-red-400 mt-1">{error}</div>}
    </div>
  )
}

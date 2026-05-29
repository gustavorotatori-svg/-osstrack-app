"use client"

import { useState } from "react"
import { toast } from "sonner"

type TipoConvite = "professor" | "aluno" | "amigo"

const config: Record<TipoConvite, {
  title: string
  desc: string
  btnLabel: string
  successMsg: string
}> = {
  professor: {
    title: "👨‍🏫 Convidar Professor",
    desc: "Gere um link para convidar um professor para sua academia.",
    btnLabel: "Gerar Link de Professor",
    successMsg: "Link de professor gerado!",
  },
  aluno: {
    title: "📲 Convidar Aluno",
    desc: "Gere um link para compartilhar com novos alunos.",
    btnLabel: "Gerar Link de Aluno",
    successMsg: "Link de aluno gerado!",
  },
  amigo: {
    title: "🤝 Convidar Amigo",
    desc: "Chame um amigo para treinar com você! Compartilhe o link.",
    btnLabel: "Gerar Meu Link",
    successMsg: "Seu link de convite foi gerado! Compartilhe com os amigos.",
  },
}

interface ConviteSectionProps {
  tipo: TipoConvite
}

export function ConviteSection({ tipo }: ConviteSectionProps) {
  const [inviteLink, setInviteLink] = useState("")
  const [whatsappLink, setWhatsappLink] = useState("")
  const [gerando, setGerando] = useState(false)
  const [copied, setCopied] = useState(false)
  const cfg = config[tipo]

  async function gerar() {
    setGerando(true)
    try {
      const res = await fetch("/api/convites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo }),
      })
      if (!res.ok) throw new Error()
      const d = await res.json()
      setInviteLink(d.link)
      setWhatsappLink(d.whatsapp)
      toast.success(cfg.successMsg)
    } catch {
      toast.error("Erro ao gerar link")
    } finally {
      setGerando(false)
    }
  }

  return (
    <div className="glass-card text-center">
      <h3 className="font-bold text-base tracking-tight mb-1">{cfg.title}</h3>
      <p className="text-sm text-[var(--white-muted)] mb-4 max-w-md mx-auto">{cfg.desc}</p>
      <div className="flex gap-2 max-w-md mx-auto mb-3">
        <input
          type="text"
          value={gerando ? "Gerando..." : inviteLink || "osstrack.app"}
          readOnly
          className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-[var(--dark-border)] text-white text-base text-center"
        />
        <button
          type="button"
          disabled={gerando}
          onClick={gerar}
          className="px-6 py-3 rounded-xl font-semibold text-sm btn-gold disabled:opacity-50 active:scale-[0.97] shrink-0"
        >
          {gerando ? "⏳" : "Gerar"}
        </button>
      </div>
      {inviteLink && (
        <div className="flex gap-3 justify-center max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(inviteLink)
              setCopied(true)
              toast.success("Link copiado!")
              setTimeout(() => setCopied(false), 2000)
            }}
            className="flex-1 py-3 rounded-xl text-sm font-semibold border border-[var(--dark-border)] hover:border-[var(--gold)] transition-all active:scale-[0.97] max-w-[160px]"
          >
            {copied ? "✅ Copiado!" : "📋 Copiar"}
          </button>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-center bg-green-600/15 text-green-400 border border-green-600/25 hover:bg-green-600/25 transition-all active:scale-[0.97] max-w-[160px]"
          >
            📲 WhatsApp
          </a>
        </div>
      )}
    </div>
  )
}

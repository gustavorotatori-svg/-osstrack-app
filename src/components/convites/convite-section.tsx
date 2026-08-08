"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useT } from "@/lib/use-t"
import { GraduationIcon, UserPlusIcon, HandshakeIcon, BuildingIcon, GiIcon, CopyIcon, MessageIcon, RefreshIcon, TimerIcon, CheckIcon, SmartphoneIcon } from "@/components/ui/icons"

type TipoConvite = "professor" | "aluno" | "amigo" | "academia"

const configKeys: Record<TipoConvite, Record<string, string>> = {
  professor: { title: "professor.title", desc: "professor.desc", btnLabel: "professor.btnLabel", successMsg: "professor.successMsg", previewTitle: "professor.previewTitle", previewBody: "professor.previewBody", cardLabel: "professor.cardLabel" },
  aluno: { title: "aluno.title", desc: "aluno.desc", btnLabel: "aluno.btnLabel", successMsg: "aluno.successMsg", previewTitle: "aluno.previewTitle", previewBody: "aluno.previewBody", cardLabel: "aluno.cardLabel" },
  amigo: { title: "amigo.title", desc: "amigo.desc", btnLabel: "amigo.btnLabel", successMsg: "amigo.successMsg", previewTitle: "amigo.previewTitle", previewBody: "amigo.previewBody", cardLabel: "amigo.cardLabel" },
  academia: { title: "academia.title", desc: "academia.desc", btnLabel: "academia.btnLabel", successMsg: "academia.successMsg", previewTitle: "academia.previewTitle", previewBody: "academia.previewBody", cardLabel: "academia.cardLabel" },
}

const iconMap: Record<string, typeof GraduationIcon> = {
  professor: GraduationIcon,
  aluno: GiIcon,
  amigo: HandshakeIcon,
  academia: BuildingIcon,
}

interface ConviteSectionProps {
  tipo: TipoConvite
}

export function ConviteSection({ tipo }: ConviteSectionProps) {
  const t = useT("convites")
  const [inviteLink, setInviteLink] = useState("")
  const [whatsappLink, setWhatsappLink] = useState("")
  const [gerando, setGerando] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [customMsg, setCustomMsg] = useState("")
  const keys = configKeys[tipo]
  const cfg = {
    title: t(keys.title), desc: t(keys.desc), btnLabel: t(keys.btnLabel),
    successMsg: t(keys.successMsg), previewTitle: t(keys.previewTitle),
    previewBody: t(keys.previewBody), cardLabel: t(keys.cardLabel),
  }
  const CardIcon = iconMap[tipo]

  const previewBodyFinal = customMsg || cfg.previewBody

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
      setCustomMsg("")
      toast.success(cfg.successMsg)
      setShowPreview(true)
    } catch {
      toast.error("Erro ao gerar link")
    } finally {
      setGerando(false)
    }
  }

  function gerarWhatsapp(msg: string) {
    const finalMsg = msg || previewBodyFinal
    const url = `https://wa.me/?text=${encodeURIComponent(finalMsg + "\n\n" + inviteLink)}`
    setWhatsappLink(url)
    window.open(url, "_blank")
  }

  return (
    <div className="glass-card text-center">
      <h3 className="font-bold text-base tracking-tight mb-1 flex items-center justify-center gap-1.5">
        {tipo === "professor" && <GraduationIcon className="w-4 h-4 text-[var(--gold)]" />}
        {tipo === "aluno" && <UserPlusIcon className="w-4 h-4 text-[var(--gold)]" />}
        {tipo === "amigo" && <HandshakeIcon className="w-4 h-4 text-[var(--gold)]" />}
        {tipo === "academia" && <BuildingIcon className="w-4 h-4 text-[var(--gold)]" />}
        {cfg.title}
      </h3>
      <p className="text-sm text-[var(--white-muted)] mb-4 max-w-md mx-auto">{cfg.desc}</p>

      {!inviteLink ? (
        <button
          type="button"
          disabled={gerando}
          onClick={gerar}
          className="btn-gold px-8 py-3 text-sm font-bold disabled:opacity-50 active:scale-[0.97] min-h-[44px]"
        >
          {gerando ? <TimerIcon className="w-4 h-4" /> : null}
          {gerando ? " Gerando..." : cfg.btnLabel}
        </button>
      ) : (
        <div className="space-y-4">
          {showPreview && (
            <div className="bg-[var(--black-soft)] border border-[var(--dark-border)] rounded-2xl p-4 text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 gradient-gold rounded-xl flex items-center justify-center">
                  <CardIcon className="w-5 h-5 text-black" />
                </div>
                <div>
                  <div className="text-sm font-bold">{cfg.previewTitle}</div>
                  <div className="text-[10px] text-[var(--white-muted)]">{cfg.cardLabel}</div>
                </div>
              </div>
              <div className="bg-[var(--dark-card)] rounded-xl p-3 mb-3 border border-[var(--dark-border)]">
                <p className="text-sm text-[var(--white-muted)] leading-relaxed">{previewBodyFinal}</p>
                <div className="mt-2 text-xs text-[var(--gold)] font-mono break-all">{inviteLink}</div>
              </div>
              <textarea
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Customize a mensagem (opcional)..."
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-[var(--dark-border)] text-white text-sm resize-none h-20"
              />
              <div className="text-[10px] text-[var(--gray)] mt-1 mb-3">
                {customMsg ? `${customMsg.length}/500 caracteres` : "Mensagem padrão será usada se não personalizar"}
              </div>
            </div>
          )}

          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              value={inviteLink}
              readOnly
              onClick={(e) => { (e.target as HTMLInputElement).select(); navigator.clipboard.writeText(inviteLink); toast.success("Link copiado!") }}
              className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-[var(--dark-border)] text-white text-sm text-center cursor-pointer min-h-[44px]"
            />
          </div>

          <div className="flex gap-3 justify-center max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(inviteLink)
                setCopied(true)
                toast.success("Link copiado!")
                setTimeout(() => setCopied(false), 2000)
              }}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border border-[var(--dark-border)] hover:border-[var(--gold)] transition-all active:scale-[0.97] max-w-[140px] min-h-[44px] flex items-center justify-center gap-1.5"
            >
              {copied ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
            <button
              onClick={() => gerarWhatsapp(customMsg)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-center bg-green-600/15 text-green-400 border border-green-600/25 hover:bg-green-600/25 transition-all active:scale-[0.97] max-w-[140px] min-h-[44px] flex items-center justify-center gap-1.5"
            >
              <SmartphoneIcon className="w-4 h-4" /> WhatsApp
            </button>
            <button
              onClick={() => { setInviteLink(""); setShowPreview(false); setCustomMsg("") }}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border border-[var(--dark-border)] text-[var(--white-muted)] hover:text-white transition-all active:scale-[0.97] max-w-[100px] min-h-[44px] flex items-center justify-center gap-1.5"
            >
              <RefreshIcon className="w-4 h-4" /> Novo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { LockIcon, SparklesIcon } from "@/components/ui/icons"
import { useT } from "@/lib/use-t"

type BadgeProps = {
  nome: string
  icone: string
  iconeBloqueado?: string
  descricao: string
  nivelLabel: string
  raridade: string
  desbloqueada: boolean
  progresso: number
  progressoMax: number
  progressoAtual?: number
}

const rarityConfig: Record<string, { border: string; bg: string; glow: string; tkey: string }> = {
  comum:    { border: "border-[var(--dark-border)]",        bg: "bg-[var(--dark-border)]/30",       glow: "",                                                       tkey: "badgeCard.comum" },
  raro:     { border: "border-blue-500/30",                 bg: "bg-blue-500/8",                    glow: "shadow-[0_0_12px_rgba(59,130,246,0.15)]",                tkey: "badgeCard.raro" },
  epico:    { border: "border-purple-500/30",               bg: "bg-purple-500/8",                  glow: "shadow-[0_0_16px_rgba(168,85,247,0.2)] animate-pulse-glow", tkey: "badgeCard.epico" },
  lendario: { border: "border-[var(--gold)]/40",            bg: "bg-[rgba(201,168,76,0.08)]",       glow: "shadow-[0_0_20px_rgba(201,168,76,0.25)] animate-pulse-glow-gold", tkey: "badgeCard.lendario" },
}

const nivelColors: Record<string, string> = {
  bronze:   "from-amber-700 to-amber-600 text-amber-100 border-amber-600/40",
  prata:    "from-gray-400 to-gray-300 text-gray-900 border-gray-300/40",
  ouro:     "from-yellow-600 to-yellow-500 text-yellow-100 border-yellow-500/40",
  diamante: "from-cyan-600 to-blue-500 text-white border-blue-400/40",
}

export function BadgeCard({
  nome, icone, iconeBloqueado, descricao, nivelLabel, raridade,
  desbloqueada, progresso, progressoMax, progressoAtual,
}: BadgeProps) {
  const t = useT("gamification")
  const rc = rarityConfig[raridade] || rarityConfig.comum
  const nc = nivelColors[nivelLabel] || nivelColors.bronze
  const pct = progressoMax > 0 ? Math.min(100, (progresso / progressoMax) * 100) : 0
  const showProgress = !desbloqueada && progressoMax > 1

  return (
    <div className={`relative group rounded-2xl p-3 text-center transition-all duration-300 cursor-default overflow-hidden
      ${desbloqueada
        ? `bg-gradient-to-br ${nc} ${rc.glow} hover:scale-105`
        : `${rc.bg} border ${rc.border} opacity-70 hover:opacity-90`}
    `}>
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${
        raridade === "raro" ? "bg-blue-500" :
        raridade === "epico" ? "bg-purple-500" :
        raridade === "lendario" ? "bg-[var(--gold)]" : "bg-white/10"
      }`} />
      <div className={`text-3xl mb-1 transition-transform duration-300 ${desbloqueada ? "animate-float" : "grayscale"}`}>
        {desbloqueada ? icone : (iconeBloqueado || <LockIcon className="w-6 h-6" />)}
      </div>

      <div className={`text-[10px] font-bold leading-tight mb-0.5 ${desbloqueada ? "text-white" : "text-[var(--white-muted)]"}`}>
        {nome}
      </div>

      <div className="text-[8px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1">
        {raridade === "lendario" && <SparklesIcon className="w-2.5 h-2.5" />}
        <span className={
          raridade === "comum" ? "text-white/40" :
          raridade === "raro" ? "text-blue-400" :
          raridade === "epico" ? "text-purple-400" :
          raridade === "lendario" ? "text-[var(--gold)]" : "text-white/40"
        }>
          {t(rc.tkey)}
        </span>
      </div>

      {showProgress && (
        <div className="mt-2">
          <div className="h-1 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--gold-dark), var(--gold))" }}
            />
          </div>
          <div className="text-[8px] text-[var(--gray)] mt-0.5">
            {progresso}/{progressoMax}
          </div>
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 px-3 py-2 rounded-xl
        bg-[var(--black)] border border-[var(--dark-border)] text-center
        opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 shadow-xl">
        <div className="text-xs font-bold text-white mb-0.5">{nome}</div>
        <div className="text-[10px] text-[var(--white-muted)] leading-relaxed">{descricao}</div>
        <div className="text-[9px] text-[var(--gold)] mt-1 font-semibold capitalize">{nivelLabel} · {t(rc.tkey)}</div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-[var(--black)] border-r border-b border-[var(--dark-border)] rotate-45" />
      </div>
    </div>
  )
}

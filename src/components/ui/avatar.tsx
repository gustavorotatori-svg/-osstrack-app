import { SparklesIcon, FlameIcon } from "@/components/ui/icons"

const beltVarMap: Record<string, string> = {
  branca: "var(--belt-branca)",
  azul: "var(--belt-azul)",
  roxa: "var(--belt-roxa)",
  marrom: "var(--belt-marrom)",
  preta: "var(--belt-preta)",
}

function beltVar(faixa: string) {
  return beltVarMap[faixa.toLowerCase()] || "var(--belt-coral)"
}

const GI_COLOR = "#f7f5f0"
const GI_OUTLINE = "rgba(0,0,0,0.38)"
const GI_LAPEL = "rgba(0,0,0,0.22)"

function beltBand(faixa: string) {
  if (faixa.toLowerCase() === "branca") return "#1a1a1a"
  return beltVar(faixa)
}

export function Avatar({ name, faixa, size = 40, mood = "normal", src }: { name: string; faixa: string; size?: number; mood?: "normal" | "fire" | "party"; src?: string | null }) {
  const deco = mood === "party" ? <SparklesIcon className="w-3 h-3" /> : mood === "fire" ? <FlameIcon className="w-3 h-3" /> : null
  const round = mood === "party" ? 0.35 : 0.25

  if (src) {
    return (
      <div className="shrink-0 relative" style={{ width: size, height: size }}>
        <img src={src} alt={name} className="w-full h-full object-cover rounded-xl" style={{ borderRadius: mood === "party" ? size * 0.35 : size * 0.25 }} />
        {deco && <span className="absolute -top-1 -right-1 text-xs">{deco}</span>}
      </div>
    )
  }

  return (
    <div className="shrink-0 relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 1 1" className="block" role="img" aria-label={name}>
        <rect x="0" y="0" width="1" height="1" rx={round} fill={beltVar(faixa)} />
        <g fill={GI_COLOR} stroke={GI_OUTLINE} strokeWidth={0.02}>
          <circle cx="0.5" cy="0.2" r="0.075" />
          <path d="M0.5 0.25 L0.56 0.25 C0.6 0.31 0.64 0.33 0.7 0.34 C0.8 0.36 0.84 0.42 0.82 0.5 C0.8 0.58 0.74 0.62 0.72 0.58 C0.74 0.66 0.76 0.75 0.72 0.79 L0.28 0.79 C0.24 0.75 0.26 0.66 0.28 0.58 C0.26 0.62 0.2 0.58 0.18 0.5 C0.16 0.42 0.2 0.36 0.3 0.34 C0.36 0.33 0.4 0.31 0.44 0.25 Z" />
        </g>
        <g fill="none" stroke={GI_LAPEL} strokeWidth={0.028} strokeLinecap="round">
          <path d="M0.5 0.31 L0.41 0.53" />
          <path d="M0.5 0.31 L0.59 0.53" />
        </g>
        <g fill={beltBand(faixa)}>
          <rect x="0.3" y="0.6" width="0.4" height="0.1" rx="0.03" />
          <rect x="0.45" y="0.595" width="0.1" height="0.11" rx="0.03" />
        </g>
      </svg>
      {deco && <span className="absolute -top-1 -right-1 text-xs">{deco}</span>}
    </div>
  )
}

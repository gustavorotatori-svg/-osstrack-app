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

function textOnBelt(faixa: string) {
  if (faixa === "Branca") return "var(--text)"
  if (faixa === "Preta") return "var(--belt-coral)"
  return "#fff"
}

export function Avatar({ name, faixa, size = 40, mood = "normal", src }: { name: string; faixa: string; size?: number; mood?: "normal" | "fire" | "party"; src?: string | null }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  const half = size / 2
  const deco = mood === "party" ? <SparklesIcon className="w-3 h-3" /> : mood === "fire" ? <FlameIcon className="w-3 h-3" /> : null

  if (src) {
    return (
      <div className="shrink-0 relative" style={{ width: size, height: size }}>
        <img src={src} alt={name} className="w-full h-full object-cover rounded-xl" style={{ borderRadius: mood === "party" ? size * 0.35 : size * 0.25 }} />
        {deco && <span className="absolute -top-1 -right-1 text-xs">{deco}</span>}
      </div>
    )
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <rect
        width={size} height={size}
        rx={mood === "party" ? size * 0.35 : size * 0.25}
        fill={beltVar(faixa)}
      />
      {deco && (
        <text x={half} y={size * 0.2} textAnchor="middle" fontSize={size * 0.22} fill="currentColor">
          {deco}
        </text>
      )}
      <text
        x={half}
        y={deco ? half + size * 0.04 : half}
        textAnchor="middle"
        dominantBaseline="central"
        fill={textOnBelt(faixa)}
        fontSize={size * 0.38}
        fontWeight="800"
        fontFamily="Inter, sans-serif"
      >
        {initials}
      </text>
    </svg>
  )
}

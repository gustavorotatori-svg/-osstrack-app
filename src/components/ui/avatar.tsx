export function Avatar({ name, faixa, size = 40, mood = "normal", src }: { name: string; faixa: string; size?: number; mood?: "normal" | "fire" | "party"; src?: string | null }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  const beltColors: Record<string, string> = {
    Branca: "#e5e5e5", Azul: "#1a3a8a", Roxa: "#5a1a8a", Marrom: "#5c3a1a", Preta: "#1a1a1a",
  }

  const bg = beltColors[faixa] || "#c9a84c"
  const textColor = faixa === "Branca" ? "#333" : faixa === "Preta" ? "#c9a84c" : "#fff"
  const half = size / 2

  const deco = mood === "party" ? "🎉" : mood === "fire" ? "🔥" : ""

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
      <defs>
        {faixa === "Preta" && (
          <linearGradient id={`belt-${name}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#333" />
            <stop offset="100%" stopColor="#111" />
          </linearGradient>
        )}
        {faixa === "Branca" && (
          <linearGradient id={`belt-${name}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5f5f5" />
            <stop offset="100%" stopColor="#ccc" />
          </linearGradient>
        )}
      </defs>
      <rect
        width={size} height={size}
        rx={mood === "party" ? size * 0.35 : size * 0.25}
        fill={faixa === "Preta" || faixa === "Branca" ? `url(#belt-${name})` : bg}
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
        fill={textColor}
        fontSize={size * 0.38}
        fontWeight="800"
        fontFamily="Inter, sans-serif"
      >
        {initials}
      </text>
    </svg>
  )
}

export function Avatar({ name, faixa, size = 40 }: { name: string; faixa: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  const beltColors: Record<string, string> = {
    Branca: "#e5e5e5",
    Azul: "#1a3a8a",
    Roxa: "#5a1a8a",
    Marrom: "#5c3a1a",
    Preta: "#1a1a1a",
  }

  const bg = beltColors[faixa] || "#c9a84c"
  const textColor = faixa === "Branca" ? "#333" : faixa === "Preta" ? "#c9a84c" : "#fff"
  const half = size / 2

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
      <rect width={size} height={size} rx={size * 0.25} fill={faixa === "Preta" || faixa === "Branca" ? `url(#belt-${name})` : bg} />
      <text
        x={half}
        y={half}
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

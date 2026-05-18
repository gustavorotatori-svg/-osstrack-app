export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ")
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date))
}

export function getBeltColor(faixa: string) {
  const cores: Record<string, string> = {
    Branca: "bg-gray-100 text-gray-900",
    Azul: "bg-blue-800 text-white",
    Roxa: "bg-purple-800 text-white",
    Marrom: "bg-amber-900 text-white",
    Preta: "bg-black text-yellow-400 border border-gray-700",
    Cinza: "bg-gray-400 text-white",
    Amarela: "bg-yellow-400 text-black",
    Laranja: "bg-orange-500 text-white",
    Verde: "bg-green-600 text-white",
  }
  return cores[faixa] || "bg-gray-100 text-gray-900"
}

export function getBeltEmoji(faixa: string) {
  const map: Record<string, string> = {
    Branca: "⬜", Azul: "🟦", Roxa: "🟪",
    Marrom: "🟫", Preta: "⬛",
  }
  return map[faixa] || "⬜"
}

/* ------------------------------------------------------------------ */
/*  Shared utilities                                                   */
/* ------------------------------------------------------------------ */

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function getBeltEmoji(faixa: string) {
  const map: Record<string, string> = {
    Branca: "⬜", Azul: "🟦", Roxa: "🟪",
    Marrom: "🟫", Preta: "⬛",
  }
  return map[faixa] || "⬜"
}

export function getBeltLevel(faixa: string): number {
  const order = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]
  const idx = order.indexOf(faixa)
  return idx >= 0 ? idx : -1
}

export function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Bom dia"
  if (h < 18) return "Boa tarde"
  return "Boa noite"
}

export function daysUntil(date: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}

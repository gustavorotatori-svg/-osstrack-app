export const DAILY_GOAL = 15
export const STATE_ID = "outreach-state-v1"
export const LOCK_ID = 269101028
export const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
export const excludedBrand = /gracie|alliance|checkmat|nova uniao|gf ?team|guigo|de la riva|\batos\b|zr ?team|team nogueira|brazilian top team|\bbtt\b|b9|barbosa|zenith|galeb brothers|soul fighters|ribeiro jiu|rmnu|g13|infight/i
export interface Prospect {
  nome: string; email: string; cidade: string; estado: string; populacao: number;
  populationSource: string; source: string; checkedAt: string; independent: boolean;
  qualification: string; personalization?: string; personalizationSource?: string;
  personalizedQuestion?: string; additionalSources?: string[]; disabledReason?: string;
}
export function qualified(a: Prospect, now = Date.now()) {
  const age = now - Date.parse(`${a.checkedAt}T12:00:00Z`)
  const personalized = typeof a.personalization === "string" && a.personalization.trim().length >= 20 && a.personalization.trim().length <= 220 &&
    a.personalizationSource === a.source && a.personalizedQuestion?.trim().endsWith("?") &&
    a.personalizedQuestion.trim().length >= 20 && a.personalizedQuestion.trim().length <= 180
  return a.independent && !a.disabledReason && age > -86400000 && age < 30 * 86400000 && a.populacao > 0 && a.populacao < 500000 &&
    a.source.startsWith("https://") && /^https:\/\/(www\.|servicodados\.)?ibge\.gov\.br\//.test(a.populationSource) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email) && personalized && !excludedBrand.test(normalize(a.nome))
}
export function brasiliaDay(now = new Date()) {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(now)
  return { day, start: new Date(`${day}T00:00:00-03:00`) }
}

export type NivelDisciplina = "BRONZE" | "PRATA" | "OURO" | "DIAMANTE" | "LENDARIO" | null

export interface NivelDisciplinaInfo {
  label: string; icone: string; cor: string; minStreak: number; minAulas: number; minMissoes: number; freezeBonus: number; descricao: string
}

export const NIVEL_DISCIPLINA_CONFIG: Record<string, NivelDisciplinaInfo> = {
  BRONZE: { label: "Bronze", icone: "🟤", cor: "#cd7f32", minStreak: 7, minAulas: 10, minMissoes: 0, freezeBonus: 0, descricao: "🟤 Primeiros passos na disciplina" },
  PRATA: { label: "Prata", icone: "⚪", cor: "#c0c0c0", minStreak: 14, minAulas: 30, minMissoes: 0, freezeBonus: 0, descricao: "⚪ Boa consistência" },
  OURO: { label: "Ouro", icone: "🟡", cor: "#ffd700", minStreak: 30, minAulas: 60, minMissoes: 0, freezeBonus: 1, descricao: "🟡 Disciplina sólida" },
  DIAMANTE: { label: "Diamante", icone: "🔷", cor: "#b9f2ff", minStreak: 60, minAulas: 120, minMissoes: 10, freezeBonus: 1, descricao: "🔷 Consistência de elite" },
  LENDARIO: { label: "Lendário", icone: "👑", cor: "#ff6b35", minStreak: 100, minAulas: 250, minMissoes: 30, freezeBonus: 2, descricao: "👑 Lendário — o ápice da disciplina" },
}

export function calcularNivelDisciplina(streak: number, totalAulas: number, totalMissoes: number): NivelDisciplina {
  if (streak >= 100 && totalAulas >= 250 && totalMissoes >= 30) return "LENDARIO"
  if (streak >= 60 && totalAulas >= 120 && totalMissoes >= 10) return "DIAMANTE"
  if (streak >= 30 && totalAulas >= 60) return "OURO"
  if (streak >= 14 && totalAulas >= 30) return "PRATA"
  if (streak >= 7 && totalAulas >= 10) return "BRONZE"
  return null
}

export async function recalcularNivelDisciplina(userId: string) {
  const prisma = (await import("@/lib/prisma")).default

  const [streakData, totalAulas, totalMissoes] = await Promise.all([
    prisma.streak.findUnique({ where: { usuarioId: userId }, select: { currentStreak: true } }),
    prisma.presenca.count({ where: { alunoId: userId, status: "confirmed" } }),
    prisma.missaoDiaria.count({ where: { alunoId: userId, concluida: true } }),
  ])

  const nivel = calcularNivelDisciplina(
    streakData?.currentStreak || 0,
    totalAulas,
    totalMissoes
  )

  await prisma.usuario.update({
    where: { id: userId },
    data: { nivelDisciplina: nivel },
  })

  return nivel
}

export function getNivelInfo(nivel: string | null) {
  if (!nivel || !NIVEL_DISCIPLINA_CONFIG[nivel]) return null
  return NIVEL_DISCIPLINA_CONFIG[nivel]
}

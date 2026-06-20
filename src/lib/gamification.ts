import prisma from "@/lib/prisma"
import { notificarUsuario } from "@/lib/notificar"

const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 5000, 7500, 10500, 14000, 18000, 22500, 28000, 35000]
const TITLES = ["Iniciante", "Guerreiro", "Lutador", "Faixa Azul", "Competidor", "Atleta", "Graduado", "Expert", "Mestre", "Grão-Mestre", "Lenda", "Kami"]

function getLevel(pontos: number) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (pontos >= LEVEL_THRESHOLDS[i]) {
      return { level: i + 1, threshold: LEVEL_THRESHOLDS[i], next: LEVEL_THRESHOLDS[i + 1] ?? null, title: TITLES[i] }
    }
  }
  return { level: 1, threshold: 0, next: 500, title: "Iniciante" }
}

export async function awardXp(userId: string, amount: number) {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { pontos: true, nome: true },
  })
  if (!user) return { leveledUp: false, newLevel: null, newTitle: null }

  const oldLevel = getLevel(user.pontos).level
  const updated = await prisma.usuario.update({
    where: { id: userId },
    data: { pontos: { increment: amount } },
    select: { pontos: true },
  })
  const newInfo = getLevel(updated.pontos)
  const leveledUp = newInfo.level > oldLevel

  if (leveledUp) {
    await notificarUsuario({
      usuarioId: userId,
      tipo: "level_up",
      titulo: `🎉 Subiu para Nível ${newInfo.level}!`,
      descricao: `Parabéns! Você alcançou o nível ${newInfo.level} — ${newInfo.title}! Continue treinando para evoluir ainda mais.`,
      link: "/dashboard/aluno",
    })
  }

  return { leveledUp, newLevel: leveledUp ? newInfo.level : null, newTitle: leveledUp ? newInfo.title : null }
}

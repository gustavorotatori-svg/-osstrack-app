import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const badges = [
  // ===== PRESENÇA (comum) =====
  { tipo: "aulas", categoria: "presenca", condicao: 10, nivel: 1, nivelLabel: "bronze", raridade: "comum", nome: "Primeiro Passo", icone: "🥋", descricao: "Complete 10 aulas" },
  { tipo: "aulas", categoria: "presenca", condicao: 25, nivel: 2, nivelLabel: "bronze", raridade: "comum", nome: "Iniciante Dedicado", icone: "🥋", descricao: "Complete 25 aulas" },
  { tipo: "aulas", categoria: "presenca", condicao: 50, nivel: 3, nivelLabel: "prata", raridade: "comum", nome: "Meio Caminho Andado", icone: "🪙", descricao: "Complete 50 aulas" },
  { tipo: "aulas", categoria: "presenca", condicao: 100, nivel: 4, nivelLabel: "prata", raridade: "comum", nome: "Centenário", icone: "🪙", descricao: "Complete 100 aulas" },
  { tipo: "aulas", categoria: "presenca", condicao: 200, nivel: 5, nivelLabel: "ouro", raridade: "raro", nome: "Veterano", icone: "🥇", descricao: "Complete 200 aulas" },
  { tipo: "aulas", categoria: "presenca", condicao: 500, nivel: 6, nivelLabel: "ouro", raridade: "raro", nome: "Dedicação de Ferro", icone: "🥇", descricao: "Complete 500 aulas" },
  { tipo: "aulas", categoria: "presenca", condicao: 1000, nivel: 7, nivelLabel: "diamante", raridade: "epico", nome: "Lenda do Tatame", icone: "💎", descricao: "Complete 1.000 aulas" },
  { tipo: "aulas", categoria: "presenca", condicao: 2000, nivel: 8, nivelLabel: "diamante", raridade: "lendario", nome: "Imortal", icone: "👑", descricao: "Complete 2.000 aulas" },

  // ===== STREAK (comum → épico) =====
  { tipo: "streak", categoria: "streak", condicao: 5, nivel: 1, nivelLabel: "bronze", raridade: "comum", nome: "Frequência", icone: "🔥", descricao: "5 dias seguidos de treino" },
  { tipo: "streak", categoria: "streak", condicao: 10, nivel: 2, nivelLabel: "prata", raridade: "comum", nome: "Ritmo", icone: "🔥", descricao: "10 dias seguidos de treino" },
  { tipo: "streak", categoria: "streak", condicao: 15, nivel: 3, nivelLabel: "prata", raridade: "comum", nome: "Constância", icone: "⚡", descricao: "15 dias seguidos de treino" },
  { tipo: "streak", categoria: "streak", condicao: 20, nivel: 4, nivelLabel: "ouro", raridade: "raro", nome: "Disciplina", icone: "⚡", descricao: "20 dias seguidos de treino" },
  { tipo: "streak", categoria: "streak", condicao: 30, nivel: 5, nivelLabel: "ouro", raridade: "raro", nome: "Inabalável", icone: "🛡️", descricao: "30 dias seguidos de treino" },
  { tipo: "streak", categoria: "streak", condicao: 50, nivel: 6, nivelLabel: "diamante", raridade: "epico", nome: "Mito da Consistência", icone: "💎", descricao: "50 dias seguidos de treino" },
  { tipo: "streak", categoria: "streak", condicao: 75, nivel: 7, nivelLabel: "diamante", raridade: "epico", nome: "Templo do Jiu-Jitsu", icone: "🏛️", descricao: "75 dias seguidos de treino" },
  { tipo: "streak", categoria: "streak", condicao: 100, nivel: 8, nivelLabel: "diamante", raridade: "lendario", nome: "O Mestre dos Mestres", icone: "👑", descricao: "100 dias seguidos de treino" },

  // ===== PRESENÇAS NO MÊS (comum → raro) =====
  { tipo: "presencas_mes", categoria: "presenca", condicao: 5, nivel: 1, nivelLabel: "bronze", raridade: "comum", nome: "Aluno do Mês I", icone: "📅", descricao: "5 presenças em um mês" },
  { tipo: "presencas_mes", categoria: "presenca", condicao: 8, nivel: 2, nivelLabel: "prata", raridade: "comum", nome: "Aluno do Mês II", icone: "📅", descricao: "8 presenças em um mês" },
  { tipo: "presencas_mes", categoria: "presenca", condicao: 12, nivel: 3, nivelLabel: "ouro", raridade: "raro", nome: "Aluno do Mês III", icone: "🏆", descricao: "12 presenças em um mês" },
  { tipo: "presencas_mes", categoria: "presenca", condicao: 15, nivel: 4, nivelLabel: "diamante", raridade: "epico", nome: "Aluno do Mês IV", icone: "💎", descricao: "15 presenças em um mês" },

  // ===== MADRUGADOR (raro) =====
  { tipo: "madrugador", categoria: "especial", condicao: 5, nivel: 1, nivelLabel: "prata", raridade: "raro", nome: "Madrugador I", icone: "🌅", descricao: "5 check-ins antes das 8h" },
  { tipo: "madrugador", categoria: "especial", condicao: 20, nivel: 2, nivelLabel: "ouro", raridade: "raro", nome: "Madrugador II", icone: "🌅", descricao: "20 check-ins antes das 8h" },
  { tipo: "madrugador", categoria: "especial", condicao: 50, nivel: 3, nivelLabel: "diamante", raridade: "epico", nome: "Madrugador III", icone: "☀️", descricao: "50 check-ins antes das 8h" },

  // ===== SOCIAL (comum → raro) =====
  { tipo: "convites", categoria: "social", condicao: 1, nivel: 1, nivelLabel: "bronze", raridade: "comum", nome: "Networking I", icone: "🤝", descricao: "Convide 1 amigo" },
  { tipo: "convites", categoria: "social", condicao: 5, nivel: 2, nivelLabel: "prata", raridade: "comum", nome: "Networking II", icone: "🤝", descricao: "Convide 5 amigos" },
  { tipo: "convites", categoria: "social", condicao: 10, nivel: 3, nivelLabel: "ouro", raridade: "raro", nome: "Embaixador", icone: "📢", descricao: "Convide 10 amigos" },
  { tipo: "convites", categoria: "social", condicao: 25, nivel: 4, nivelLabel: "diamante", raridade: "epico", nome: "Líder Comunitário", icone: "👑", descricao: "Convide 25 amigos" },

  // ===== MESTRE DO MÊS (épico) =====
  { tipo: "mestre_mes", categoria: "especial", condicao: 1, nivel: 1, nivelLabel: "ouro", raridade: "epico", nome: "Mestre do Mês I", icone: "🏆", descricao: "Seja Mestre do Mês 1 vez" },
  { tipo: "mestre_mes", categoria: "especial", condicao: 3, nivel: 2, nivelLabel: "diamante", raridade: "epico", nome: "Mestre do Mês II", icone: "🏆", descricao: "Seja Mestre do Mês 3 vezes" },
  { tipo: "mestre_mes", categoria: "especial", condicao: 6, nivel: 3, nivelLabel: "diamante", raridade: "lendario", nome: "Mestre do Ano", icone: "👑", descricao: "Seja Mestre do Mês 6 vezes" },

  // ===== GRADUAÇÃO (épico → lendário) =====
  { tipo: "faixa_azul", categoria: "graduacao", condicao: 1, nivel: 1, nivelLabel: "prata", raridade: "epico", nome: "Azul", icone: "🟦", descricao: "Alcance a faixa azul" },
  { tipo: "faixa_roxa", categoria: "graduacao", condicao: 1, nivel: 1, nivelLabel: "ouro", raridade: "epico", nome: "Roxa", icone: "🟣", descricao: "Alcance a faixa roxa" },
  { tipo: "faixa_marrom", categoria: "graduacao", condicao: 1, nivel: 1, nivelLabel: "ouro", raridade: "epico", nome: "Marrom", icone: "🟤", descricao: "Alcance a faixa marrom" },
  { tipo: "faixa_preta", categoria: "graduacao", condicao: 1, nivel: 1, nivelLabel: "diamante", raridade: "lendario", nome: "Preta", icone: "⬛", descricao: "Alcance a faixa preta" },

  // ===== SEMANA COMPLETA (comum) =====
  { tipo: "semana_completa", categoria: "presenca", condicao: 1, nivel: 1, nivelLabel: "bronze", raridade: "comum", nome: "Semana Cheia I", icone: "📅", descricao: "Treine 5 dias em uma semana" },
  { tipo: "semana_completa", categoria: "presenca", condicao: 4, nivel: 2, nivelLabel: "prata", raridade: "comum", nome: "Semana Cheia II", icone: "📅", descricao: "Treine 5 dias em 4 semanas diferentes" },
  { tipo: "semana_completa", categoria: "presenca", condicao: 10, nivel: 3, nivelLabel: "ouro", raridade: "raro", nome: "Mestre Semanal", icone: "🏆", descricao: "Treine 5 dias em 10 semanas diferentes" },

  // ===== GUERREIRO (raro) =====
  { tipo: "feriado", categoria: "especial", condicao: 3, nivel: 1, nivelLabel: "prata", raridade: "raro", nome: "Guerreiro I", icone: "⚔️", descricao: "Treine em 3 feriados" },
  { tipo: "feriado", categoria: "especial", condicao: 10, nivel: 2, nivelLabel: "ouro", raridade: "epico", nome: "Guerreiro II", icone: "⚔️", descricao: "Treine em 10 feriados" },
]

async function main() {
  console.log("🌱 Seeding badges...")

  for (const badge of badges) {
    await prisma.conquista.upsert({
      where: {
        id: `${badge.tipo}_${badge.condicao}_${badge.nivel}`,
      },
      update: badge,
      create: {
        id: `${badge.tipo}_${badge.condicao}_${badge.nivel}`,
        ...badge,
      },
    })
  }

  const count = await prisma.conquista.count()
  console.log(`✅ ${count} badges seeded`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

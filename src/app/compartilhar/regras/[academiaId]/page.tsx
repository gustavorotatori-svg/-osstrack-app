import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"

const beltIcons: Record<string, string> = {
  Branca: "⬜", Azul: "🟦", Roxa: "🟪", Marrom: "🟫", Preta: "⬛",
}

const regrasLabels: Record<string, string> = {
  graus: "Por graus",
  aulas: "Por total de aulas",
  prova: "Por data de exame",
}

const beltOrder = ["Branca", "Azul", "Roxa", "Marrom", "Preta"]

export default async function CompartilharRegrasPage({ params }: { params: Promise<{ academiaId: string }> }) {
  const { academiaId } = await params

  const academia = await prisma.academia.findUnique({ where: { id: academiaId } })
  if (!academia) notFound()

  const graduacoes = await prisma.graduacao.findMany({
    where: { academiaId, categoria: "adulto" },
    orderBy: { aulasProxFx: "asc" },
  })

  const sorted = graduacoes.sort(
    (a, b) => beltOrder.indexOf(a.faixa) - beltOrder.indexOf(b.faixa)
  )

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://osstrack-app.vercel.app"

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="ambient-orbs">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>

      <main className="relative z-10 max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 gradient-gold rounded-xl flex items-center justify-center text-sm text-black font-bold animate-float">
              🥋
            </div>
          </div>
          <h1 className="text-xl font-bold gradient-gold-text">{academia.nome}</h1>
          <p className="text-sm text-[var(--white-muted)] mt-1">
            {academia.cidade}{academia.cidade && academia.estado ? ", " : ""}{academia.estado}
          </p>
          <p className="text-xs text-[var(--white-muted)] mt-3 max-w-xs mx-auto leading-relaxed">
            &ldquo;Cada faixa é um capítulo. Cada grau, uma página virada com dedicação.&rdquo;
          </p>
        </div>

        <div className="glass-card p-6 mb-6">
          <h3 className="font-bold text-sm mb-1 text-center">🥋 Regras de Graduação</h3>
          <p className="text-[10px] text-[var(--white-muted)] text-center mb-5">
            Categoria: Adulto
          </p>

          {sorted.length === 0 ? (
            <div className="text-center py-8 text-sm text-[var(--white-muted)]">
              Nenhuma regra cadastrada ainda.
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map((g, i) => {
                const totalAulasFaixa = g.aulasProxFx || g.graus * g.aulasPorGrau
                return (
                  <div key={g.id} className="bg-black/40 border border-[var(--dark-border)] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{beltIcons[g.faixa] || "🥋"}</span>
                      <h4 className="font-bold text-sm">{g.faixa}</h4>
                      {i === 0 && <span className="tag-premium text-[8px]">Início</span>}
                      {i === sorted.length - 1 && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[rgba(201,168,76,0.1)] text-[var(--gold)]">
                          TOPO
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-black/30 rounded-lg px-2 py-2 text-center">
                        <div className="text-[9px] text-[var(--gray)] uppercase">Graus</div>
                        <div className="text-sm font-bold text-[var(--gold)]">{g.graus}</div>
                      </div>
                      <div className="bg-black/30 rounded-lg px-2 py-2 text-center">
                        <div className="text-[9px] text-[var(--gray)] uppercase">Aulas/Grau</div>
                        <div className="text-sm font-bold text-[var(--gold)]">{g.aulasPorGrau}</div>
                      </div>
                      <div className="bg-black/30 rounded-lg px-2 py-2 text-center">
                        <div className="text-[9px] text-[var(--gray)] uppercase">Total</div>
                        <div className="text-sm font-bold text-[var(--gold)]">{totalAulasFaixa}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[rgba(201,168,76,0.08)] text-[var(--gold)]">
                        {regrasLabels[g.regraTroca] || g.regraTroca}
                      </span>
                      {g.aulasMinimasAno && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[rgba(139,26,26,0.08)] text-[var(--red)]">
                          Mín. {g.aulasMinimasAno}/ano
                        </span>
                      )}
                    </div>

                    {g.dataProva && (
                      <div className="mt-2 text-[10px] text-[var(--white-muted)]">
                        📅 Prova: {new Date(g.dataProva).toLocaleDateString("pt-BR")}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="text-center mt-6 text-[10px] text-[var(--gray)]">
            <p>Total de aulas necessário por faixa pode variar conforme o progresso individual.</p>
          </div>
        </div>

        <div className="glass-card p-6 text-center">
          <p className="text-xs text-[var(--white-muted)] mb-1">
            Quer fazer parte dessa jornada?
          </p>
          <p className="text-sm font-bold gradient-gold-text">
            {academia.nome} te espera
          </p>
          <a
            href={`${baseUrl}/cadastro?academiaId=${academiaId}&academia=${encodeURIComponent(academia.nome)}`}
            className="inline-block mt-4 btn-gold px-8 py-3 text-sm font-bold"
          >
            Quero Treinar Aqui 🥋
          </a>
        </div>

        <div className="text-center mt-8 text-[10px] text-[var(--gray)]">
          <span className="opacity-50">powered by </span>
          <span className="gradient-gold-text font-semibold">OssTrack</span>
        </div>
      </main>
    </div>
  )
}

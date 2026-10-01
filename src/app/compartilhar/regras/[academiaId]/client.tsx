"use client"

import Link from "next/link"
import { useT } from "@/lib/use-t"
import { useLocale } from "@/components/layout/providers"
import { intlLocales } from "@/lib/i18n"

const beltIcons: Record<string, string> = {
  Branca: "⬜", Azul: "🟦", Roxa: "🟪", Marrom: "🟫", Preta: "⬛",
}

const regraTrocaKeys: Record<string, string> = {
  graus: "modoGraus",
  aulas: "modoAulas",
  prova: "modoProva",
}

export type GraduacaoView = {
  id: string
  faixa: string
  graus: number
  aulasPorGrau: number
  aulasProxFx: number | null
  aulasMinimasAno: number | null
  dataProva: string | null
  regraTroca: string
}

export function RegrasView({
  nome,
  cidade,
  estado,
  graduacoes,
  cadastroHref,
}: {
  nome: string
  cidade: string
  estado: string
  graduacoes: GraduacaoView[]
  cadastroHref: string
}) {
  const t = useT("pagRegras")
  const { locale } = useLocale()

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="ambient-orbs">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>

      <main className="relative z-10 max-w-lg mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--white-muted)] hover:text-white transition-colors mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          {t("voltar")}
        </Link>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-10 h-10 gradient-gold rounded-xl flex items-center justify-center text-sm text-black font-bold animate-float">
              🥋
            </div>
          </div>
          <h1 className="text-xl font-bold gradient-gold-text">{nome}</h1>
          <p className="text-sm text-[var(--white-muted)] mt-1">
            {cidade}{cidade && estado ? ", " : ""}{estado}
          </p>
          <p className="text-xs text-[var(--white-muted)] mt-3 max-w-xs mx-auto leading-relaxed">
            {t("motto")}
          </p>
        </div>

        <div className="glass-card p-6 mb-6">
          <h3 className="font-bold text-sm mb-1 text-center">🥋 {t("titulo")}</h3>
          <p className="text-[10px] text-[var(--white-muted)] text-center mb-5">
            {t("categoria")}
          </p>

          {graduacoes.length === 0 ? (
            <div className="text-center py-8 text-sm text-[var(--white-muted)]">
              {t("vazio")}
            </div>
          ) : (
            <div className="space-y-4">
              {graduacoes.map((g, i) => {
                const totalAulasFaixa = g.aulasProxFx || g.graus * g.aulasPorGrau
                return (
                  <div key={g.id} className="bg-black/40 border border-[var(--dark-border)] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{beltIcons[g.faixa] || "🥋"}</span>
                      <h4 className="font-bold text-sm">{g.faixa}</h4>
                      {i === 0 && <span className="tag-destaque text-[8px]">{t("inicio")}</span>}
                      {i === graduacoes.length - 1 && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[rgba(201,168,76,0.1)] text-[var(--gold)]">
                          {t("topo")}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-black/30 rounded-lg px-2 py-2 text-center">
                        <div className="text-[9px] text-[var(--gray)] uppercase">{t("graus")}</div>
                        <div className="text-sm font-bold text-[var(--gold)]">{g.graus}</div>
                      </div>
                      <div className="bg-black/30 rounded-lg px-2 py-2 text-center">
                        <div className="text-[9px] text-[var(--gray)] uppercase">{t("aulasPorGrau")}</div>
                        <div className="text-sm font-bold text-[var(--gold)]">{g.aulasPorGrau}</div>
                      </div>
                      <div className="bg-black/30 rounded-lg px-2 py-2 text-center">
                        <div className="text-[9px] text-[var(--gray)] uppercase">{t("total")}</div>
                        <div className="text-sm font-bold text-[var(--gold)]">{totalAulasFaixa}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[rgba(201,168,76,0.08)] text-[var(--gold)]">
                        {regraTrocaKeys[g.regraTroca] ? t(regraTrocaKeys[g.regraTroca]) : g.regraTroca}
                      </span>
                      {g.aulasMinimasAno && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[rgba(139,26,26,0.08)] text-[var(--red)]">
                          {t("minAno").replace("{n}", String(g.aulasMinimasAno))}
                        </span>
                      )}
                    </div>

                    {g.dataProva && (
                      <div className="mt-2 text-[10px] text-[var(--white-muted)]">
                        📅 {t("prova").replace("{data}", new Date(g.dataProva).toLocaleDateString(intlLocales[locale]))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="text-center mt-6 text-[10px] text-[var(--gray)]">
            <p>{t("rodape")}</p>
          </div>
        </div>

        <div className="glass-card p-6 text-center">
          <p className="text-xs text-[var(--white-muted)] mb-1">
            {t("ctaIntro")}
          </p>
          <p className="text-sm font-bold gradient-gold-text">
            {t("ctaNome").replace("{academia}", nome)}
          </p>
          <a
            href={cadastroHref}
            className="inline-block mt-4 btn-gold px-8 py-3 text-sm font-bold"
          >
            {t("ctaBotao")} 🥋
          </a>
        </div>

        <div className="text-center mt-8 text-[10px] text-[var(--gray)]">
          <span className="opacity-50">{t("poweredBy")} </span>
          <span className="gradient-gold-text font-semibold">OssTrack</span>
        </div>
      </main>
    </div>
  )
}

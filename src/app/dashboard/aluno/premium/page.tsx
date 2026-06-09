"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { usePremium } from "@/lib/use-premium"
import { toast } from "sonner"
import { useT } from "@/lib/use-t"
import { PaletteIcon, ChartIcon, TargetIcon, CrownIcon, MedalIcon, Share2Icon, CreditCardIcon, CheckIcon, XIcon, CalendarIcon, InfinityIcon, SparklesIcon, StarIcon } from "@/components/ui/icons"

const featuresList = [
  { icon: <PaletteIcon className="w-5 h-5" />, name: "Arte para Instagram", desc: "Compartilhe sua evolução com cards bonitos" },
  { icon: <ChartIcon className="w-5 h-5" />, name: "Analytics Avançados", desc: "Gráficos, heatmap mensal e previsão de faixa" },
  { icon: <TargetIcon className="w-5 h-5" />, name: "Metas & Missões", desc: "Desafios diários e meta semanal personalizada" },
  { icon: <CrownIcon className="w-5 h-5" />, name: "Ranking Detalhado", desc: "Veja sua posição e o ranking completo da academia" },
  { icon: <MedalIcon className="w-5 h-5" />, name: "Histórico Ilimitado", desc: "Acesse todas as suas presenças antigas" },
  { icon: <Share2Icon className="w-5 h-5" />, name: "Exportar Jornada", desc: "Baixe PDF com toda sua evolução no Jiu-Jitsu" },
]

const comparisonRows = [
  { label: "Check-in diário", free: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" />, premium: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
  { label: "Progresso de faixa", free: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" />, premium: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
  { label: "Conquistas", free: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" />, premium: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
  { label: "Histórico de presenças", free: <>30 dias <CalendarIcon className="w-3 h-3 inline" /></>, premium: <><InfinityIcon className="w-3.5 h-3.5 inline text-[var(--gold)]" /> Ilimitado</> },
  { label: "Missões diárias", free: <XIcon className="w-3.5 h-3.5 inline text-red-400" />, premium: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
  { label: "Meta semanal", free: <XIcon className="w-3.5 h-3.5 inline text-red-400" />, premium: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
  { label: "Arte para compartilhar", free: <XIcon className="w-3.5 h-3.5 inline text-red-400" />, premium: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
  { label: "Analytics avançados", free: <XIcon className="w-3.5 h-3.5 inline text-red-400" />, premium: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
  { label: "Ranking completo", free: <XIcon className="w-3.5 h-3.5 inline text-red-400" />, premium: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
  { label: "Exportar jornada (PDF)", free: <XIcon className="w-3.5 h-3.5 inline text-red-400" />, premium: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
  { label: "Suporte prioritário", free: <XIcon className="w-3.5 h-3.5 inline text-red-400" />, premium: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
]

export default function PremiumPage() {
  const t = useT("aluno.premium")
  const { data: session } = useSession()
  const { isPremium, loading: premiumStatusLoading } = usePremium()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function assinar() {
    setLoading(true)
    const res = await fetch("/api/premium/checkout", { method: "POST" })
    if (res.ok) {
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } else {
      const err = await res.json()
      toast.error(err.error || "Erro ao processar assinatura")
    }
    setLoading(false)
  }

  if (premiumStatusLoading) {
    return (
      <DashboardShell role="aluno">
        <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)]">Carregando...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="aluno">
      <div className="max-w-5xl mx-auto space-y-6">
        {isPremium ? (
          <>
            {/* Already premium */}
            <div className="relative overflow-hidden rounded-2xl border border-[rgba(201,168,76,0.2)] bg-gradient-to-br from-[rgba(201,168,76,0.1)] via-[rgba(10,10,10,0.8)] to-[rgba(10,10,10,0.9)] p-8 text-center">
              <div className="absolute top-[-60px] right-[-60px] w-40 h-40 bg-[var(--gold)]/5 rounded-full blur-3xl" />
              <div className="absolute bottom-[-40px] left-[-40px] w-32 h-32 bg-[var(--gold)]/3 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgba(201,168,76,0.2)] to-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)] flex items-center justify-center mx-auto mb-4">
                  <CrownIcon className="w-8 h-8 text-[var(--gold)]" />
                </div>
                <h2 className="text-2xl font-black text-[var(--gold)]">Você já é Premium!</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-md mx-auto">
                  Aproveite todos os recursos desbloqueados. Continue treinando e evoluindo!
                </p>
                <button
                  onClick={() => router.push("/dashboard/aluno")}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 mt-6 rounded-xl text-sm font-bold bg-gradient-to-r from-[var(--gold)] to-[#e8c84a] text-black hover:shadow-lg hover:shadow-[var(--gold)]/20 transition-all active:scale-95"
                >
                  Ir para o Dashboard
                </button>
              </div>
            </div>

            {/* Features list for premium */}
            <div className="tech-card p-6">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-[var(--gold)]" /> Seus recursos Premium
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {featuresList.map((f) => (
                  <div key={f.name} className="flex items-start gap-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-xl px-4 py-3">
                    <span className="shrink-0 text-[var(--gold)]">{f.icon}</span>
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-1.5">
                        {f.name}
                        <CheckIcon className="w-3 h-3 text-emerald-400" />
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)]">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* CTA Card */}
            <div className="relative overflow-hidden rounded-2xl border border-[rgba(201,168,76,0.15)] bg-gradient-to-br from-[rgba(201,168,76,0.08)] via-[rgba(10,10,10,0.8)] to-[rgba(10,10,10,0.9)] p-8 text-center">
              <div className="absolute top-[-60px] right-[-60px] w-40 h-40 bg-[var(--gold)]/5 rounded-full blur-3xl" />
              <div className="absolute bottom-[-40px] left-[-40px] w-32 h-32 bg-[var(--gold)]/3 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgba(201,168,76,0.2)] to-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)] flex items-center justify-center mx-auto mb-4">
                  <CrownIcon className="w-8 h-8 text-[var(--gold)]" />
                </div>
                <h2 className="text-2xl font-black text-[var(--gold)]">OssTrack Premium</h2>
                <div className="mt-3 mb-1">
                  <span className="text-4xl font-black text-white">R$4,99</span>
                  <span className="text-sm text-[var(--text-secondary)]">/mês</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">7 dias grátis · Cancele quando quiser</p>

                <div className="mt-6 space-y-2 text-left max-w-sm mx-auto">
                  {featuresList.map((f) => (
                    <div key={f.name} className="flex items-start gap-3.5 bg-[rgba(10,10,10,0.5)] border border-[rgba(255,255,255,0.04)] rounded-xl px-4 py-3 hover:border-[rgba(201,168,76,0.1)] transition-all">
                      <span className="shrink-0 text-[var(--gold)]">{f.icon}</span>
                      <div>
                        <div className="text-sm font-semibold">{f.name}</div>
                        <div className="text-[11px] text-[var(--text-secondary)]">{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={assinar}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-8 py-3.5 mt-6 rounded-xl text-base font-bold bg-gradient-to-r from-[var(--gold)] to-[#e8c84a] text-black hover:shadow-xl hover:shadow-[var(--gold)]/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Processando...</>
                  ) : (
                    <><CrownIcon className="w-5 h-5" /> Começar período grátis</>
                  )}
                </button>

                <p className="text-[10px] text-[var(--text-muted)] mt-3">
                  * Modo de simulação sem integração real com Stripe
                </p>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="tech-card p-6">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <CreditCardIcon className="w-4 h-4 text-[var(--gold)]" /> Comparação de planos
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[rgba(255,255,255,0.06)]">
                      <th className="text-left py-3 px-2 text-[var(--text-secondary)] font-semibold">Funcionalidade</th>
                      <th className="text-center py-3 px-2 w-20 text-[var(--text-muted)] font-semibold text-xs">Grátis</th>
                      <th className="text-center py-3 px-2 w-20 text-[var(--gold)] font-semibold text-xs">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, i) => (
                      <tr key={i} className="border-b border-[rgba(255,255,255,0.03)] last:border-0 hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                        <td className="py-3 px-2 text-sm">{row.label}</td>
                        <td className="text-center py-3 px-2">{row.free}</td>
                        <td className="text-center py-3 px-2 font-semibold">{row.premium}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Testimonial */}
            <div className="tech-card p-6 text-center">
              <div className="flex items-center justify-center gap-0.5 mb-2">
                {[1,2,3,4,5].map(i => <StarIcon key={i} className="w-4 h-4 text-[var(--gold)]" />)}
              </div>
              <p className="text-sm text-[var(--text-secondary)] italic max-w-lg mx-auto">
                "O OssTrack transformou a forma como acompanho minha evolução no Jiu-Jitsu. As missões diárias me mantêm motivado a não perder nenhum treino."
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-2">— Carlos, Faixa Azul · OssTrack Premium</p>
            </div>

            {/* Bottom CTA */}
            <button
              onClick={assinar}
              disabled={loading}
              className="w-full py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-[var(--gold)] to-[#e8c84a] text-black hover:shadow-xl hover:shadow-[var(--gold)]/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Processando...</>
              ) : (
                <><CrownIcon className="w-5 h-5" /> Começar período grátis de 7 dias</>
              )}
            </button>
          </>
        )}
      </div>
    </DashboardShell>
  )
}
"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { useRouter } from "next/navigation"
import { CrownIcon, CheckIcon, SparklesIcon, StarIcon, ChartIcon, Share2Icon, PaletteIcon, MedalIcon, InfinityIcon, CreditCardIcon } from "@/components/ui/icons"

const featuresList = [
  { icon: <ChartIcon className="w-5 h-5" />, name: "Analytics Avançados", desc: "Gráficos, heatmap mensal e previsão de faixa" },
  { icon: <Share2Icon className="w-5 h-5" />, name: "Exportar Jornada", desc: "Baixe PDF com toda sua evolução no Jiu-Jitsu" },
  { icon: <PaletteIcon className="w-5 h-5" />, name: "Arte para Compartilhar", desc: "Cards bonitos com sua evolução para postar" },
  { icon: <MedalIcon className="w-5 h-5" />, name: "Suporte Prioritário", desc: "Atendimento via WhatsApp com prioridade" },
]

const comparisonRows = [
  { label: "Check-in diário", icon: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
  { label: "Progresso de faixa", icon: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
  { label: "Conquistas", icon: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
  { label: "Missões diárias", icon: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
  { label: "Meta semanal", icon: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
  { label: "Ranking completo", icon: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
  { label: "Histórico de presenças", icon: <><InfinityIcon className="w-3.5 h-3.5 inline text-emerald-500" /> Ilimitado</> },
  { label: "Arte para compartilhar", icon: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
  { label: "Analytics avançados", icon: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
  { label: "Exportar jornada (PDF)", icon: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
  { label: "Suporte prioritário", icon: <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> },
]

export default function PremiumPage() {
  const router = useRouter()

  return (
    <DashboardShell role="aluno">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* All features unlocked */}
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(201,168,76,0.2)] bg-gradient-to-br from-[rgba(201,168,76,0.1)] via-[rgba(10,10,10,0.8)] to-[rgba(10,10,10,0.9)] p-8 text-center">
          <div className="absolute top-[-60px] right-[-60px] w-40 h-40 bg-[var(--gold)]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-40px] left-[-40px] w-32 h-32 bg-[var(--gold)]/3 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgba(201,168,76,0.2)] to-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)] flex items-center justify-center mx-auto mb-4">
              <CrownIcon className="w-8 h-8 text-[var(--gold)]" />
            </div>
            <h2 className="text-2xl font-black text-[var(--gold)]">Todos os recursos liberados!</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-md mx-auto">
              Aproveite todos os recursos gratuitamente. Continue treinando e evoluindo!
            </p>
            <button
              onClick={() => router.push("/dashboard/aluno")}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 mt-6 rounded-xl text-sm font-bold bg-gradient-to-r from-[var(--gold)] to-[#e8c84a] text-black hover:shadow-lg hover:shadow-[var(--gold)]/20 transition-all active:scale-95"
            >
              Ir para o Dashboard
            </button>
          </div>
        </div>

        {/* Features list */}
        <div className="tech-card p-6">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-[var(--gold)]" /> Recursos disponíveis
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

        {/* Comparison Table */}
        <div className="tech-card p-6">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <CreditCardIcon className="w-4 h-4 text-[var(--gold)]" /> Funcionalidades
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  <th className="text-left py-3 px-2 text-[var(--text-secondary)] font-semibold">Funcionalidade</th>
                  <th className="text-center py-3 px-2 w-20 text-[var(--gold)] font-semibold text-xs">Disponível</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="border-b border-[rgba(255,255,255,0.03)] last:border-0 hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                    <td className="py-3 px-2 text-sm">{row.label}</td>
                    <td className="text-center py-3 px-2">{row.icon}</td>
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
          <p className="text-xs text-[var(--text-muted)] mt-2">— Carlos, Faixa Azul · OssTrack</p>
        </div>
      </div>
    </DashboardShell>
  )
}
"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { BackButton } from "@/components/ui/back-button"
import { useRouter } from "next/navigation"
import { useT } from "@/lib/use-t"
import { CrownIcon, CheckIcon, SparklesIcon, ChartIcon, Share2Icon, PaletteIcon, MedalIcon } from "@/components/ui/icons"

const featuresList = [
  { icon: <ChartIcon className="w-5 h-5" />, nameKey: "recurso1Nome", descKey: "recurso1Desc" },
  { icon: <Share2Icon className="w-5 h-5" />, nameKey: "recurso2Nome", descKey: "recurso2Desc" },
  { icon: <PaletteIcon className="w-5 h-5" />, nameKey: "recurso3Nome", descKey: "recurso3Desc" },
  { icon: <MedalIcon className="w-5 h-5" />, nameKey: "recurso4Nome", descKey: "recurso4Desc" },
]

export default function PremiumPage() {
  const t = useT("aluno.premium")
  const router = useRouter()

  return (
    <DashboardShell role="aluno">
      <div className="max-w-5xl mx-auto space-y-6">
        <BackButton href="/dashboard/aluno" />
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(201,168,76,0.2)] bg-gradient-to-br from-[rgba(201,168,76,0.1)] via-[rgba(10,10,10,0.8)] to-[rgba(10,10,10,0.9)] p-8 text-center">
          <div className="absolute top-[-60px] right-[-60px] w-40 h-40 bg-[var(--gold)]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-40px] left-[-40px] w-32 h-32 bg-[var(--gold)]/3 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgba(201,168,76,0.2)] to-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)] flex items-center justify-center mx-auto mb-4">
              <CrownIcon className="w-8 h-8 text-[var(--gold)]" />
            </div>
            <h2 className="text-2xl font-black text-[var(--gold)]">{t("titulo")}</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-md mx-auto">
              {t("descricao")}
            </p>
            <button
              onClick={() => router.push("/dashboard/aluno")}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 mt-6 rounded-xl text-sm font-bold bg-gradient-to-r from-[var(--gold)] to-[#e8c84a] text-black hover:shadow-lg hover:shadow-[var(--gold)]/20 transition-all active:scale-95"
            >
              {t("irParaDashboard")}
            </button>
          </div>
        </div>

        {/* Features list */}
        <div className="tech-card p-6">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-[var(--gold)]" /> {t("recursosDisponiveis")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {featuresList.map((f) => (
              <div key={f.nameKey} className="flex items-start gap-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-xl px-4 py-3">
                <span className="shrink-0 text-[var(--gold)]">{f.icon}</span>
                <div>
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    {t(f.nameKey)}
                    <CheckIcon className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">{t(f.descKey)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
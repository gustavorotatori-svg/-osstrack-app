"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useT } from "@/lib/use-t"
import { PaletteIcon, ChartIcon, TargetIcon, CrownIcon, MedalIcon, Share2Icon, CreditCardIcon, CheckIcon, XIcon, CalendarIcon, InfinityIcon } from "@/components/ui/icons"

export default function PremiumPage() {
  const t = useT("aluno.premium")
  const { data: session } = useSession()
  const router = useRouter()
  const [plano, setPlano] = useState<string>("free")
  const [diasRestantes, setDiasRestantes] = useState(0)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch("/api/premium").then((r) => r.json()).then((d) => {
      setPlano(d.plano)
      setDiasRestantes(d.diasRestantes)
    })
  }, [])

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

  const features: { icon: React.ReactNode; name: string; desc: string }[] = Array.from({ length: 6 }, (_, i) => ({
    icon: [<PaletteIcon className="w-5 h-5" />, <ChartIcon className="w-5 h-5" />, <TargetIcon className="w-5 h-5" />, <CrownIcon className="w-5 h-5" />, <MedalIcon className="w-5 h-5" />, <Share2Icon className="w-5 h-5" />][i],
    name: t(`features.${i}.name`),
    desc: t(`features.${i}.desc`),
  }))

  return (
    <DashboardShell role="aluno">
      <div className="space-y-4">
        {done ? (
          <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--gold)]/20 rounded-2xl p-8 text-center animate-scale-in">
            <CrownIcon className="w-12 h-12 mb-4 animate-float mx-auto text-[var(--gold)]" />
            <h2 className="text-xl font-extrabold gradient-gold-text">{t("bemVindo")}</h2>
            <p className="text-sm text-[var(--white-muted)] mt-2">
              {t("contaAtualizada")}
            </p>
            <button
              onClick={() => router.push("/dashboard/aluno")}
              className="btn-gold px-8 py-3 mt-6 text-sm"
            >
              {t("irDashboard")}
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-[rgba(201,168,76,0.1)] to-[rgba(201,168,76,0.02)] border border-[var(--gold)]/20 rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="absolute top-[-40px] right-[-40px] w-40 h-40 bg-[var(--gold)]/5 rounded-full blur-3xl" />
              <CrownIcon className="w-8 h-8 mb-2 mx-auto text-[var(--gold)]" />
              <h2 className="text-xl font-extrabold gradient-gold-text">{t("title")}</h2>
              <p className="text-sm text-[var(--white-muted)] mt-1">{t("preco")}</p>

              <div className="mt-6 space-y-3 text-left max-w-sm mx-auto">
                {features.map((f) => (
                  <div key={f.name} className="flex items-start gap-3.5 bg-black/20 rounded-xl px-4 py-3">
                    <span className="shrink-0 text-[var(--gold)]">{f.icon}</span>
                    <div>
                      <div className="text-sm font-semibold">{f.name}</div>
                      <div className="text-[11px] text-[var(--white-muted)]">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={assinar}
                disabled={loading || plano === "premium"}
                className="btn-gold w-full max-w-sm py-3.5 mt-6 text-sm font-bold disabled:opacity-50"
              >
                {loading ? t("processando") : plano === "premium" ? t("jaPremium") : t("assinar")}
              </button>

              <p className="text-[10px] text-[var(--gray)] mt-3">
                {t("simulacao")}
              </p>
            </div>

            <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5">
              <h3 className="font-bold text-sm tracking-tight mb-3"><CreditCardIcon className="w-4 h-4 inline -mt-0.5 mr-1.5" />{t("comparacao")}</h3>
              <div className="space-y-1">
                {Array.from({ length: 9 }, (_, i) => ({
                  label: t(`comparacaoRows.${i}.label`),
                  free: i === 3 ? <><span>{t("trintaDias")}</span> <CalendarIcon className="w-3 h-3 inline" /></> : i <= 2 ? <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" /> : <XIcon className="w-3.5 h-3.5 inline text-red-400" />,
                  premium: i === 3 ? <><InfinityIcon className="w-3.5 h-3.5 inline text-[var(--gold)]" /> {t("ilimitado")}</> : <CheckIcon className="w-3.5 h-3.5 inline text-emerald-500" />,
                })).map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2.5 px-3 rounded-xl text-xs border-b border-[var(--dark-border)] last:border-0">
                    <span className="text-[var(--white-muted)]">{row.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-center w-16">{row.free}</span>
                      <span className="text-center w-20 font-semibold">{row.premium}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  )
}

"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

export default function PremiumPage() {
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

  const features = [
    { icon: "🎨", name: "Sua jornada em arte", desc: "Transforme suas estatísticas em artes prontas para Instagram. Sua história merece ser vista." },
    { icon: "📊", name: "Histórico sem fim", desc: "Acesse cada aula, cada grau, cada check-in desde o primeiro dia. Sua linha do tempo no tatame." },
    { icon: "🎯", name: "Metas que te movem", desc: "Metas semanais de treino que se adaptam a você. O único objetivo é continuar aparecendo." },
    { icon: "👑", name: "Mestre do Mês", desc: "O título que todo mundo quer. Quem mais treinou no mês leva o badge de honra no perfil." },
    { icon: "🏅", name: "7 dias de missões", desc: "Onboarding gamificado que transforma seus primeiros 7 dias em uma jornada de descoberta." },
    { icon: "📤", name: "Inspire quem vem atrás", desc: "Compartilhe sua evolução nas redes sociais. Cada post seu pode ser o empurrão que alguém precisa pra começar." },
  ]

  return (
    <DashboardShell role="aluno">
      <div className="space-y-4">
        {done ? (
          <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--gold)]/20 rounded-2xl p-8 text-center animate-scale-in">
            <div className="text-5xl mb-4 animate-float">👑</div>
            <h2 className="text-xl font-extrabold gradient-gold-text">Bem-vindo ao Premium!</h2>
            <p className="text-sm text-[var(--white-muted)] mt-2">
              Sua conta foi atualizada. Aproveite todos os benefícios!
            </p>
            <button
              onClick={() => router.push("/dashboard/aluno")}
              className="btn-gold px-8 py-3 mt-6 text-sm"
            >
              Ir para o Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-[rgba(201,168,76,0.1)] to-[rgba(201,168,76,0.02)] border border-[var(--gold)]/20 rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="absolute top-[-40px] right-[-40px] w-40 h-40 bg-[var(--gold)]/5 rounded-full blur-3xl" />
              <div className="text-3xl mb-2">👑</div>
              <h2 className="text-xl font-extrabold gradient-gold-text">OssTrack Premium</h2>
              <p className="text-sm text-[var(--white-muted)] mt-1">R$4,90/mês · Cancele quando quiser</p>

              <div className="mt-6 space-y-3 text-left max-w-sm mx-auto">
                {features.map((f) => (
                  <div key={f.name} className="flex items-start gap-3.5 bg-black/20 rounded-xl px-4 py-3">
                    <span className="text-lg shrink-0">{f.icon}</span>
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
                {loading ? "Processando..." : plano === "premium" ? "✓ Você já é Premium" : "Assinar por R$4,90/mês"}
              </button>

              <p className="text-[10px] text-[var(--gray)] mt-3">
                * Simulação de pagamento. Em produção, integração com Stripe/Asaas será ativada.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-5">
              <h3 className="font-bold text-sm tracking-tight mb-3">💳 Comparação</h3>
              <div className="space-y-1">
                {[
                  { label: "Check-in com geolocalização", free: "✅", premium: "✅" },
                  { label: "Ver ranking da academia", free: "✅", premium: "✅" },
                  { label: "Ver evolução", free: "✅", premium: "✅" },
                  { label: "Histórico completo de presenças", free: "30 dias 📅", premium: "Ilimitado ♾️" },
                  { label: "Arte para Instagram", free: "❌", premium: "✅" },
                  { label: "Metas semanais personalizadas", free: "❌", premium: "✅" },
                  { label: "Badge Mestre do Mês", free: "❌", premium: "✅" },
                  { label: "Onboarding com 7 missões", free: "❌", premium: "✅" },
                  { label: "Compartilhar conquistas", free: "❌", premium: "✅" },
                ].map((row) => (
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

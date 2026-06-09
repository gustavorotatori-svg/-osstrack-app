"use client"

import { LockIcon, CrownIcon } from "@/components/ui/icons"
import { useT } from "@/lib/use-t"
import { useRouter } from "next/navigation"

export function PremiumLock({ children, isLocked, featureName }: { children: React.ReactNode; isLocked: boolean; featureName?: string }) {
  const t = useT("premiumLock")
  const router = useRouter()
  if (!isLocked) return <>{children}</>

  return (
    <div className="relative group">
      <div className="pointer-events-none select-none">
        <div className="blur-sm opacity-30">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[rgba(201,168,76,0.15)] to-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)] flex items-center justify-center mx-auto mb-3">
              <CrownIcon className="w-6 h-6 text-[var(--gold)]" />
            </div>
            <p className="text-sm font-bold text-[var(--gold)] mb-1">
              {featureName || t("funcionalidade")}
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] mb-4 max-w-[200px] mx-auto">
              {t("descricao")}
            </p>
            <button
              onClick={() => router.push("/dashboard/aluno/premium")}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[var(--gold)] to-[#e8c84a] text-black hover:shadow-lg hover:shadow-[var(--gold)]/20 transition-all active:scale-95"
            >
              <CrownIcon className="w-3.5 h-3.5" />
              {t("assinar")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PremiumBanner({ onClick }: { onClick?: () => void }) {
  const t = useT("premiumLock")
  const router = useRouter()
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[rgba(201,168,76,0.15)] bg-gradient-to-br from-[rgba(201,168,76,0.08)] via-[rgba(10,10,10,0.6)] to-[rgba(10,10,10,0.8)] p-6 text-center group hover:border-[rgba(201,168,76,0.3)] transition-all">
      <div className="absolute top-[-40px] right-[-40px] w-32 h-32 bg-[var(--gold)]/5 rounded-full blur-3xl" />
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[rgba(201,168,76,0.2)] to-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)] flex items-center justify-center mx-auto mb-3">
          <CrownIcon className="w-7 h-7 text-[var(--gold)]" />
        </div>
        <h3 className="font-bold text-base text-[var(--gold)]">{t("titulo")}</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1 mb-5 max-w-xs mx-auto">
          {t("descricao")}
        </p>
        <button
          onClick={onClick || (() => router.push("/dashboard/aluno/premium"))}
          className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[var(--gold)] to-[#e8c84a] text-black hover:shadow-lg hover:shadow-[var(--gold)]/20 transition-all active:scale-95"
        >
          <CrownIcon className="w-4 h-4" />
          {t("assinar")}
        </button>
        <p className="text-[10px] text-[var(--text-muted)] mt-3">
          Apenas R$4,99/mês · Cancele quando quiser
        </p>
      </div>
    </div>
  )
}
"use client"

import { LockIcon, CrownIcon } from "@/components/ui/icons"
import { useT } from "@/lib/use-t"

export function PremiumLock({ children, isLocked }: { children: React.ReactNode; isLocked: boolean }) {
  const t = useT("premiumLock")
  if (!isLocked) return <>{children}</>

  return (
    <div className="relative group">
      <div className="pointer-events-none select-none">
        <div className="blur-[2px] opacity-40">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <LockIcon className="w-6 h-6 mb-1 mx-auto" />
            <p className="text-xs text-[var(--white-muted)]">{t("funcionalidade")}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PremiumBanner({ onClick }: { onClick?: () => void }) {
  const t = useT("premiumLock")
  return (
    <div className="bg-gradient-to-r from-[rgba(201,168,76,0.1)] to-[rgba(201,168,76,0.02)] border border-[var(--gold)]/20 rounded-2xl p-5 text-center hover-card">
      <CrownIcon className="w-8 h-8 mb-2 mx-auto" />
      <h3 className="font-bold text-sm text-[var(--gold)]">{t("titulo")}</h3>
      <p className="text-xs text-[var(--white-muted)] mt-1 mb-4">
        {t("descricao")}
      </p>
      <button
        onClick={onClick}
        className="btn-gold px-6 py-2.5 text-xs font-bold"
      >
        {t("assinar")}
      </button>
    </div>
  )
}

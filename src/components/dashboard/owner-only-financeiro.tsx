"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { BackButton } from "@/components/ui/back-button"
import { useT } from "@/lib/use-t"

export function OwnerOnlyFinanceiro() {
  const t = useT("financeiro")
  return (
    <DashboardShell role="professor">
      <BackButton href="/dashboard/professor/financeiro" />
      <div className="max-w-5xl mx-auto">
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-4">💰</div>
          <h2 className="text-lg font-bold mb-2">{t("titulo")}</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            {t("descricao")}
          </p>
        </div>
      </div>
    </DashboardShell>
  )
}

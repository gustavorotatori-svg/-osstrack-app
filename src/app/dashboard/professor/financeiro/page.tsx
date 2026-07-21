"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { PageTransition } from "@/components/ui/page-transition"
import { BackButton } from "@/components/ui/back-button"

export default function ProfessorFinanceiroPage() {
  return (
    <DashboardShell role="professor">
      <BackButton href="/dashboard/professor" />
      <PageTransition>
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-4">💰</div>
            <h2 className="text-lg font-bold mb-2">Financeiro</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              O gerenciamento financeiro está disponível no dashboard do dono da academia.
            </p>
          </div>
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

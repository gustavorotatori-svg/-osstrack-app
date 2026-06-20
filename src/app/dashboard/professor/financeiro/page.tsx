"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { PageTransition } from "@/components/ui/page-transition"
import Link from "next/link"

export default function ProfessorFinanceiroPage() {
  return (
    <DashboardShell role="professor">
      <PageTransition>
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-4">💰</div>
            <h2 className="text-lg font-bold mb-2">Financeiro</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              O gerenciamento financeiro está disponível no dashboard do dono da academia.
            </p>
            <Link
              href="/dashboard/professor"
              className="btn-gold px-6 py-2.5 text-sm font-bold inline-flex items-center gap-2"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

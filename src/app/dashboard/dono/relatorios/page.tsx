"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { useT } from "@/lib/use-t"

export default function RelatoriosPage() {
  const t = useT("dono.relatorios")
  return (
    <DashboardShell role="dono">
      <div className="animate-fade-in space-y-4">
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <h3 className="font-bold mb-3">{t("title")}</h3>
          <div className="flex gap-1 bg-[var(--dark-border)] rounded-lg p-1 mb-4 overflow-x-auto">
            {[t("frequencia"), t("evolucao"), t("retencao"), t("engajamento")].map((tab) => (
              <button key={tab} className={`px-4 py-2 rounded-md text-xs font-semibold whitespace-nowrap ${
                tab === t("frequencia") ? "bg-[var(--gold)] text-black" : "text-[var(--white-muted)]"
              }`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <h3 className="font-bold mb-4">{t("frequenciaMes")}</h3>
          <div className="flex items-end gap-2 h-24">
            {["Jan", "Fev", "Mar", "Abr", "Maio"].map((m, i) => {
              const h = [60, 45, 70, 55, 65][i]
              return (
                <div key={m} className="flex-1 flex flex-col items-center">
                  <span className="text-[9px] text-[var(--white-muted)] mb-1">{h}</span>
                  <div className="w-full bg-gradient-to-b from-[var(--gold)] to-[var(--gold-dark)] rounded-t-sm" style={{ height: `${h}%` }} />
                  <span className="text-[9px] text-[var(--gray)] mt-1">{m}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: t("presencaHoje"), value: "85%" },
            { label: t("retencao6m"), value: "92%" },
            { label: t("totalAulas"), value: "845" },
            { label: t("engajamentoLabel"), value: "78%" },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold text-[var(--gold)]">{s.value}</div>
              <div className="text-[11px] text-[var(--white-muted)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}

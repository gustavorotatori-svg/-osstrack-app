"use client"

import { DashboardShell } from "@/components/dashboard/shell"

export default function ConfigPage() {
  return (
    <DashboardShell role="dono">
      <div className="animate-fade-in space-y-4">
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <h3 className="font-bold mb-4">⚙️ Configurações</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">Nome da Academia</label>
              <input type="text" defaultValue="Gracie Barra Recife" className="w-full px-4 py-2.5 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm focus:border-[var(--gold)] outline-none transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">Raio de Check-in (metros)</label>
              <input type="number" defaultValue={200} className="w-full px-4 py-2.5 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm focus:border-[var(--gold)] outline-none transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">Horário de Funcionamento</label>
              <div className="flex gap-2">
                <input type="time" defaultValue="06:00" className="flex-1 px-4 py-2.5 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm focus:border-[var(--gold)] outline-none transition-all" />
                <input type="time" defaultValue="22:00" className="flex-1 px-4 py-2.5 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm focus:border-[var(--gold)] outline-none transition-all" />
              </div>
            </div>
            <button className="w-full py-3 rounded-lg font-bold gradient-gold text-black">Salvar Configurações</button>
          </div>
        </div>

        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <h3 className="font-bold mb-3">📱 Compartilhar App</h3>
          <p className="text-xs text-[var(--white-muted)] mb-3">Compartilhe o link do OssTrack com seus alunos:</p>
          <div className="flex gap-2">
            <input type="text" value="osstrack.app/graciebarra-recife" readOnly className="flex-1 px-4 py-2.5 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm" />
            <button className="px-4 py-2.5 rounded-lg font-semibold text-xs gradient-gold text-black">Copiar</button>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"

export default function ConfigPage() {
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    nome: "",
    whatsapp: "",
    pixKey: "",
    raio: 200,
    horarioInicio: "06:00",
    horarioFim: "22:00",
  })

  useEffect(() => {
    fetch("/api/academia")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setForm({
            nome: data.nome || "",
            whatsapp: data.whatsapp || "",
            pixKey: data.pixKey || "",
            raio: data.raio || 200,
            horarioInicio: data.horarioInicio || "06:00",
            horarioFim: data.horarioFim || "22:00",
          })
        }
      })
      .catch(() => {})
  }, [])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/academia", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <DashboardShell role="dono">
      <div className="animate-fade-in space-y-4">
        <form onSubmit={salvar} className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-6 space-y-4">
          <h3 className="font-bold">⚙️ Configurações da Academia</h3>

          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">Nome da Academia</label>
            <input
              type="text"
              className="input-premium"
              value={form.nome}
              onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">WhatsApp da Academia</label>
            <input
              type="text"
              className="input-premium"
              placeholder="(81) 99999-8888"
              value={form.whatsapp}
              onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
            />
            <p className="text-[9px] text-[var(--gray)] mt-1">Usado nas notificações de cobrança e promoção via WhatsApp</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">Chave PIX</label>
            <input
              type="text"
              className="input-premium"
              placeholder="CPF, CNPJ, e-mail ou telefone"
              value={form.pixKey}
              onChange={(e) => setForm((p) => ({ ...p, pixKey: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">Raio de Check-in (metros)</label>
            <input
              type="number"
              className="input-premium"
              value={form.raio}
              onChange={(e) => setForm((p) => ({ ...p, raio: Number(e.target.value) }))}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--white-muted)] block mb-1.5">Horário de Funcionamento</label>
            <div className="flex gap-2">
              <input type="time" className="input-premium" value={form.horarioInicio} onChange={(e) => setForm((p) => ({ ...p, horarioInicio: e.target.value }))} />
              <input type="time" className="input-premium" value={form.horarioFim} onChange={(e) => setForm((p) => ({ ...p, horarioFim: e.target.value }))} />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-bold text-sm btn-gold"
          >
            {saved ? "✅ Salvo!" : "Salvar Configurações"}
          </button>
        </form>

        <div className="bg-gradient-to-br from-[var(--dark-card)] to-black/40 border border-[var(--dark-border)] rounded-2xl p-6">
          <h3 className="font-bold mb-3">📱 Compartilhar App</h3>
          <p className="text-xs text-[var(--white-muted)] mb-3">Compartilhe o link do OssTrack com seus alunos:</p>
          <div className="flex gap-2">
            <input type="text" value="osstrack.app" readOnly className="flex-1 px-4 py-2.5 rounded-lg bg-black border border-[var(--dark-border)] text-white text-sm" />
            <button
              type="button"
              onClick={() => { navigator.clipboard.writeText("osstrack.app"); setSaved(true); setTimeout(() => setSaved(false), 2000) }}
              className="px-4 py-2.5 rounded-lg font-semibold text-xs btn-gold"
            >
              Copiar
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

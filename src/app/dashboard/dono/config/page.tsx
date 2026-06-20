"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { useT } from "@/lib/use-t"
import { PageTransition } from "@/components/ui/page-transition"

function ConviteCard({ tipo, label, state, setState }: {
  tipo: string
  label: string
  state: { link: string; whatsapp: string; copied: boolean; gerando: boolean }
  setState: (s: { link: string; whatsapp: string; copied: boolean; gerando: boolean }) => void
}) {
  const t = useT("dono.config")
  return (
    <div>
      <p className="text-xs text-[var(--text-secondary)] mb-2">{label}</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={state.gerando ? t("gerando") : state.link || "osstrack.app"}
          readOnly
          className="flex-1 px-4 py-2.5 rounded-lg bg-black border border-[var(--border)] text-white text-sm"
        />
        <button
          type="button"
          disabled={state.gerando}
          onClick={async () => {
            setState({ ...state, gerando: true })
            const res = await fetch("/api/convites", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tipo }),
            })
            if (res.ok) {
              const data = await res.json()
              setState({ link: data.link, whatsapp: data.whatsapp, copied: false, gerando: false })
            } else {
              setState({ ...state, gerando: false })
            }
          }}
          className="btn btn-primary px-4 py-2.5 rounded-lg font-semibold text-xs disabled:opacity-50"
        >
          {t("gerarLink")}
        </button>
      </div>
      {state.link && (
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(state.link)
              setState({ ...state, copied: true })
              setTimeout(() => setState({ ...state, copied: false }), 2000)
            }}
            className="flex-1 py-2 rounded-lg text-xs font-semibold border border-[var(--border)] hover:border-[var(--gold)] transition-all"
          >
            {state.copied ? t("copiado") : t("copiarLink")}
          </button>
          <a
            href={state.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 rounded-lg text-xs font-semibold text-center bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30 transition-all"
          >
            📲 WhatsApp
          </a>
        </div>
      )}
    </div>
  )
}

export default function ConfigPage() {
  const t = useT("dono.config")
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [inviteProf, setInviteProf] = useState({ link: "", whatsapp: "", copied: false, gerando: false })
  const [inviteAluno, setInviteAluno] = useState({ link: "", whatsapp: "", copied: false, gerando: false })
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
      .then((r) => {
        if (!r.ok) throw new Error("Falha ao carregar dados")
        return r.json()
      })
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
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
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

  if (loading) {
    return (
      <DashboardShell role="dono">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="glass-card p-6 space-y-4">
            <div className="h-6 w-48 glass-card rounded-lg" />
            <div className="h-10 w-full glass-card rounded-lg" />
            <div className="h-10 w-full glass-card rounded-lg" />
            <div className="h-10 w-full glass-card rounded-lg" />
            <div className="h-10 w-full glass-card rounded-lg" />
            <div className="h-10 w-full glass-card rounded-lg" />
            <div className="h-12 w-full glass-card rounded-xl" />
          </div>
          <div className="glass-card p-6 space-y-4">
            <div className="h-6 w-40 glass-card rounded-lg" />
            <div className="h-16 w-full glass-card rounded-lg" />
            <div className="h-16 w-full glass-card rounded-lg" />
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (error) {
    return (
      <DashboardShell role="dono">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-12 text-center">
            <p className="text-red-400 font-semibold">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn btn-primary px-6 py-2.5 rounded-lg font-semibold text-xs mt-4"
            >
              Recarregar
            </button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="dono">
      <PageTransition>
        <div className="max-w-5xl mx-auto animate-fade-in space-y-4">
          <form onSubmit={salvar} className="glass-card p-6 space-y-4">
            <h3 className="font-bold">{t("title")}</h3>

            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">{t("nomeAcademia")}</label>
              <input
                type="text"
                className="input-field"
                value={form.nome}
                onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">{t("whatsapp")}</label>
              <input
                type="text"
                className="input-field"
                placeholder={t("placeholderWhatsapp")}
                value={form.whatsapp}
                onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
              />
              <p className="text-[9px] text-[var(--text-muted)] mt-1">{t("whatsappDesc")}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">{t("chavePix")}</label>
              <input
                type="text"
                className="input-field"
                placeholder={t("placeholderPix")}
                value={form.pixKey}
                onChange={(e) => setForm((p) => ({ ...p, pixKey: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">{t("raioCheckin")}</label>
              <input
                type="number"
                className="input-field"
                value={form.raio}
                onChange={(e) => setForm((p) => ({ ...p, raio: Number(e.target.value) }))}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">{t("horarioFuncionamento")}</label>
              <div className="flex gap-2">
                <input type="time" className="input-field" value={form.horarioInicio} onChange={(e) => setForm((p) => ({ ...p, horarioInicio: e.target.value }))} />
                <input type="time" className="input-field" value={form.horarioFim} onChange={(e) => setForm((p) => ({ ...p, horarioFim: e.target.value }))} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full py-3.5 rounded-xl font-bold text-sm"
            >
              {saved ? t("salvo") : t("salvar")}
            </button>
          </form>

          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold">{t("compartilhar")}</h3>

            <ConviteCard
              tipo="professor"
              label={t("convidarProfessor")}
              state={inviteProf}
              setState={setInviteProf}
            />

            <ConviteCard
              tipo="aluno"
              label={t("convidarAluno")}
              state={inviteAluno}
              setState={setInviteAluno}
            />
          </div>
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

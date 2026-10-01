"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { PageTransition } from "@/components/ui/page-transition"
import { BackButton } from "@/components/ui/back-button"
import { CardSkeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useT } from "@/lib/use-t"
import { useLocale } from "@/components/layout/providers"
import { intlLocales } from "@/lib/i18n"
import { FileText, CheckCircle2, Clock } from "lucide-react"

type WaiverTermo = { versao: number; titulo: string; conteudo: string }
type WaiverAssinatura = { assinadoEm: string; nomeCompleto: string; cpf: string }

export default function AlunoWaiverPage() {
  const t = useT("aluno.waiver")
  const { locale } = useLocale()
  const [loading, setLoading] = useState(true)
  const [termo, setTermo] = useState<WaiverTermo | null>(null)
  const [minhaAssinatura, setMinhaAssinatura] = useState<WaiverAssinatura | null>(null)
  const [nomeCompleto, setNomeCompleto] = useState("")
  const [cpf, setCpf] = useState("")
  const [assinando, setAssinando] = useState(false)

  useEffect(() => {
    fetch("/api/waiver/termo")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        setTermo(d?.termo || null)
        setMinhaAssinatura(d?.minhaAssinatura || null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function assinar(e: React.FormEvent) {
    e.preventDefault()
    setAssinando(true)
    try {
      const r = await fetch("/api/waiver/assinar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomeCompleto, cpf }),
      })
      if (r.ok) {
        const assinatura = await r.json()
        setMinhaAssinatura(assinatura)
        toast.success(t("toastAssinado"))
      } else {
        const err = await r.json().catch(() => null)
        toast.error(err?.error || t("erroAssinar"))
      }
    } catch {
      toast.error(t("erroConexao"))
    } finally {
      setAssinando(false)
    }
  }

  return (
    <DashboardShell role="aluno">
      <BackButton href="/dashboard/aluno/perfil" />
      <PageTransition>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl gradient-gold flex items-center justify-center text-black shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{t("titulo")}</h3>
              <p className="text-xs text-[var(--text-secondary)]">{t("subtitulo")} {termo ? "" : t("carregando")}</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div>
          ) : !termo ? (
            <div className="glass-card p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[rgba(212,168,71,0.06)] border border-[rgba(212,168,71,0.1)] flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-[var(--gold)]" />
              </div>
              <h4 className="font-bold mb-1">{t("semTermoTitulo")}</h4>
              <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
                {t("semTermoDesc")}
              </p>
            </div>
          ) : minhaAssinatura ? (
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-600/15 border border-green-600/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="font-bold text-lg mb-1">{t("assinadoTitulo")}</h4>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                {t("assinadoDesc").replace("{versao}", String(termo.versao)).replace("{data}", new Date(minhaAssinatura.assinadoEm).toLocaleDateString(intlLocales[locale]))}.
              </p>
              <div className="max-w-md mx-auto text-left rounded-xl p-4" style={{ background: "var(--bg-surface)" }}>
                <p className="text-xs text-[var(--text-muted)] mb-1">{t("assinadoComo")}</p>
                <p className="text-sm font-bold">{minhaAssinatura.nomeCompleto}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-2">
                  {t("cpfNota")}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold">{termo.titulo}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(212,168,71,0.1)] text-[var(--gold)] font-semibold">
                    {t("versaoBadge").replace("{versao}", String(termo.versao))}
                  </span>
                </div>
                <div className="text-sm text-[var(--white-muted)] leading-relaxed whitespace-pre-line max-h-72 overflow-y-auto pr-2">
                  {termo.conteudo}
                </div>
              </div>

              <form onSubmit={assinar} className="glass-card p-6 space-y-4">
                <h4 className="font-bold">{t("assinarTitulo")}</h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  {t("assinarDesc")}
                </p>
                <div>
                  <label className="block text-xs font-semibold text-[var(--white-muted)] mb-1.5">{t("nomeLabel")}</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder={t("nomePlaceholder")}
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--white-muted)] mb-1.5">{t("cpfLabel")}</label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    className="input-field"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={assinando}
                  className="btn-gold px-8 py-3.5 text-sm font-bold w-full disabled:opacity-50 active:scale-[0.98]"
                >
                  {assinando ? t("assinando") : t("assinarBtn")}
                </button>
              </form>
            </>
          )}
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { PageTransition } from "@/components/ui/page-transition"
import { BackButton } from "@/components/ui/back-button"
import { CardSkeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { FileText, CheckCircle2, Clock } from "lucide-react"

export default function AlunoWaiverPage() {
  const [loading, setLoading] = useState(true)
  const [termo, setTermo] = useState<any>(null)
  const [minhaAssinatura, setMinhaAssinatura] = useState<any>(null)
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
        toast.success("Termo assinado com sucesso!")
      } else {
        const err = await r.json().catch(() => null)
        toast.error(err?.error || "Não foi possível assinar o termo")
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.")
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
              <h3 className="font-bold text-lg">Termo de Responsabilidade</h3>
              <p className="text-xs text-[var(--text-secondary)]">Termo da academia {termo ? "" : "— carregando..."}</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div>
          ) : !termo ? (
            <div className="glass-card p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[rgba(212,168,71,0.06)] border border-[rgba(212,168,71,0.1)] flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-[var(--gold)]" />
              </div>
              <h4 className="font-bold mb-1">Ainda não há termo disponível</h4>
              <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
                Sua academia ainda não publicou o termo de responsabilidade. Ele aparecerá aqui quando disponível.
              </p>
            </div>
          ) : minhaAssinatura ? (
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-600/15 border border-green-600/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="font-bold text-lg mb-1">Termo assinado!</h4>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Versão {termo.versao} assinada em {new Date(minhaAssinatura.assinadoEm).toLocaleDateString("pt-BR")}.
              </p>
              <div className="max-w-md mx-auto text-left rounded-xl p-4" style={{ background: "var(--bg-surface)" }}>
                <p className="text-xs text-[var(--text-muted)] mb-1">Assinado como</p>
                <p className="text-sm font-bold">{minhaAssinatura.nomeCompleto}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-2">
                  CPF e dados de assinatura armazenados de forma segura para fins legais.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold">{termo.titulo}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(212,168,71,0.1)] text-[var(--gold)] font-semibold">
                    Versão {termo.versao}
                  </span>
                </div>
                <div className="text-sm text-[var(--white-muted)] leading-relaxed whitespace-pre-line max-h-72 overflow-y-auto pr-2">
                  {termo.conteudo}
                </div>
              </div>

              <form onSubmit={assinar} className="glass-card p-6 space-y-4">
                <h4 className="font-bold">Assinar termo</h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  Ao assinar, você declara que leu e concorda com o termo acima. A assinatura é registrada digitalmente
                  (nome, CPF, data e dispositivo) e vale como assinatura para todos os fins legais.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-[var(--white-muted)] mb-1.5">Nome completo</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="Seu nome completo"
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--white-muted)] mb-1.5">CPF</label>
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
                  {assinando ? "Assinando..." : "Assinar termo"}
                </button>
              </form>
            </>
          )}
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

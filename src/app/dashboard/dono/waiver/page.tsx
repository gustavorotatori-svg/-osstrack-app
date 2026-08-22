"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { PageTransition } from "@/components/ui/page-transition"
import { BackButton } from "@/components/ui/back-button"
import { CardSkeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { FileText, CheckCircle2, AlertTriangle } from "lucide-react"

export default function DonoWaiverPage() {
  const [loading, setLoading] = useState(true)
  const [titulo, setTitulo] = useState("Termo de Responsabilidade")
  const [conteudo, setConteudo] = useState("")
  const [versao, setVersao] = useState(0)
  const [salvando, setSalvando] = useState(false)
  const [assinaturas, setAssinaturas] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/waiver/termo").then((r) => r.ok ? r.json() : null),
      fetch("/api/waiver/assinaturas").then((r) => r.ok ? r.json() : null),
    ]).then(([t, a]) => {
      if (t?.termo) {
        setTitulo(t.termo.titulo || "Termo de Responsabilidade")
        setConteudo(t.termo.conteudo || "")
        setVersao(t.termo.versao || 0)
      }
      if (a) setAssinaturas(a)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSalvando(true)
    try {
      const r = await fetch("/api/waiver/termo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, conteudo }),
      })
      if (r.ok) {
        const termo = await r.json()
        setVersao(termo.versao)
        toast.success("Termo salvo! Nova versão: " + termo.versao)
        const a = await fetch("/api/waiver/assinaturas").then((x) => x.ok ? x.json() : null)
        if (a) setAssinaturas(a)
      } else {
        const err = await r.json().catch(() => null)
        toast.error(err?.error || "Erro ao salvar")
      }
    } catch {
      toast.error("Erro de conexão")
    } finally {
      setSalvando(false)
    }
  }

  const pendentes = assinaturas?.alunos?.filter((a: any) => !a.assinado) || []
  const assinaram = assinaturas?.alunos?.filter((a: any) => a.assinado) || []

  return (
    <DashboardShell role="dono">
      <BackButton href="/dashboard/dono" />
      <PageTransition>
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl gradient-gold flex items-center justify-center text-black shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Termo de Responsabilidade</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Waiver digital — documento que os alunos assinam no app (nome, CPF, data e dispositivo)
              </p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <CardSkeleton key={i} />)}</div>
          ) : (
            <>
              <form onSubmit={salvar} className="glass-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold">Texto do termo</h4>
                  {versao > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(212,168,71,0.1)] text-[var(--gold)] font-semibold">
                      Versão {versao}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--white-muted)] mb-1.5">Título</label>
                  <input
                    type="text"
                    className="input-field"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--white-muted)] mb-1.5">
                    Conteúdo (riscos, responsabilidades e consentimento LGPD)
                  </label>
                  <textarea
                    rows={14}
                    className="input-field resize-none"
                    placeholder={"Escreva aqui o termo que os alunos devem aceitar. Ex.:\n\n• Declaro estar ciente dos riscos inerentes à prática de Jiu-Jitsu.\n• Autorizo o tratamento dos meus dados conforme a LGPD...\n• ..."}
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={salvando}
                    className="btn-gold px-8 py-3 text-sm font-bold disabled:opacity-50 active:scale-[0.98]"
                  >
                    {salvando ? "Salvando..." : versao > 0 ? "Salvar nova versão" : "Publicar termo"}
                  </button>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Ao salvar, a versão aumenta e alunos que já assinaram a anterior podem assinar a nova.
                  </p>
                </div>
              </form>

              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold">Assinaturas dos alunos</h4>
                  <div className="flex gap-2 text-[10px] font-bold">
                    <span className="px-2.5 py-1 rounded-full bg-green-900/40 text-green-400">{assinaram.length} assinaram</span>
                    <span className="px-2.5 py-1 rounded-full bg-red-900/40 text-red-400">{pendentes.length} pendentes</span>
                  </div>
                </div>

                {pendentes.length > 0 && (
                  <div className="rounded-xl p-3 flex items-start gap-2.5" style={{ background: "rgba(212,168,71,0.06)", border: "1px solid rgba(212,168,71,0.15)" }}>
                    <AlertTriangle className="w-4 h-4 text-[var(--gold)] shrink-0 mt-0.5" />
                    <p className="text-xs text-[var(--text-secondary)]">
                      {pendentes.length} aluno(s) ainda não assinaram o termo. A assinatura é o comprovante de
                      responsabilidade do aluno — recomenda-se não permitir treino sem ela.
                    </p>
                  </div>
                )}

                {assinaturas && assinaram.length === 0 && pendentes.length === 0 ? (
                  <p className="text-sm text-[var(--text-secondary)] text-center py-6">Nenhum aluno cadastrado ainda.</p>
                ) : (
                  <div className="space-y-1.5">
                    {[...assinaram, ...pendentes].map((a: any) => (
                      <div key={a.alunoId} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--bg-surface)" }}>
                        <div className="flex items-center gap-3 min-w-0">
                          {a.assinado ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{a.nome}</p>
                            <p className="text-[10px] text-[var(--text-muted)]">
                              {a.faixa} · {a.assinado ? `assinou em ${new Date(a.assinatura.assinadoEm).toLocaleDateString("pt-BR")} (CPF ${a.assinatura.cpf})` : "ainda não assinou"}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0 ${a.assinado ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
                          {a.assinado ? "Assinado" : "Pendente"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </PageTransition>
    </DashboardShell>
  )
}

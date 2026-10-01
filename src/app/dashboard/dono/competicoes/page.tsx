"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { BackButton } from "@/components/ui/back-button"
import { DashboardShell } from "@/components/dashboard/shell"
import { useT } from "@/lib/use-t"
import { useLocale } from "@/components/layout/providers"
import { intlLocales } from "@/lib/i18n"

interface Competicao {
  id: string
  nome: string
  data: string
  local: string | null
  faixa: string | null
  categoria: string | null
  observacoes: string | null
  participacoes: {
    id: string
    posicao: string | null
    categoria: string | null
    aluno: { id: string; nome: string; faixa: string; avatar: string | null }
  }[]
}

interface Aluno {
  id: string
  nome: string
  faixa: string
}

const medalhas = { ouro: "🥇", prata: "🥈", bronze: "🥉", participou: "🏅" }
const posicoes = [
  { value: "ouro", label: "posOuro" },
  { value: "prata", label: "posPrata" },
  { value: "bronze", label: "posBronze" },
  { value: "participou", label: "posParticipou" },
] as const

export default function CompeticoesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useT("dono.competicoes")
  const { locale } = useLocale()
  const [competicoes, setCompeticoes] = useState<Competicao[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (session && session.user.role === "aluno") router.push("/dashboard/aluno")
  }, [session, status, router])

  useEffect(() => {
    if (!session) return
    Promise.all([
      fetch("/api/competicoes").then((r) => r.json()),
      fetch("/api/academia/alunos").then((r) => r.json()),
    ]).then(([c, a]) => {
      setCompeticoes(c)
      setAlunos(a.alunos || a || [])
      setLoading(false)
    })
  }, [session])

  async function criarCompeticao(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const res = await fetch("/api/competicoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: fd.get("nome"),
        data: fd.get("data"),
        local: fd.get("local"),
        faixa: fd.get("faixa"),
        categoria: fd.get("categoria"),
      }),
    })
    if (res.ok) {
      const nova = await res.json()
      setCompeticoes((prev) => [nova, ...prev])
      setShowForm(false)
      ;(e.target as HTMLFormElement).reset()
    }
  }

  async function adicionarParticipacao(competicaoId: string, alunoId: string, posicao: string) {
    const res = await fetch(`/api/competicoes/${competicaoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participacoes: [{ alunoId, posicao }] }),
    })
    if (res.ok) {
      const atualizada = await res.json()
      setCompeticoes((prev) => prev.map((c) => (c.id === competicaoId ? atualizada : c)))
    }
  }

  async function excluirCompeticao(id: string) {
    if (!confirm(t("confirmarExcluir"))) return
    await fetch(`/api/competicoes?id=${id}`, { method: "DELETE" })
    setCompeticoes((prev) => prev.filter((c) => c.id !== id))
  }

  if (status === "loading" || loading) {
    return (
      <DashboardShell role={session?.user?.role === "dono" ? "dono" : "professor"}>
        <div className="max-w-5xl mx-auto">
          <div className="belt-loading w-24 h-4 rounded mb-6" />
          <div className="belt-loading w-2/3 h-8 rounded mb-2" />
          <div className="belt-loading w-1/3 h-3 rounded mb-8" />
          <div className="glass-card p-5"><div className="belt-loading w-full h-16 rounded" /></div>
          <div className="glass-card p-5"><div className="belt-loading w-full h-16 rounded" /></div>
        </div>
      </DashboardShell>
    )
  }

  const role = session?.user?.role
  const basePath = role === "dono" ? "/dashboard/dono" : "/dashboard/professor"
  const shellRole = role === "dono" ? "dono" : "professor"

  return (
    <DashboardShell role={shellRole}>
      <div className="max-w-5xl mx-auto">
        <BackButton href={basePath} />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight gradient-gold-text">{t("title")}</h1>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{t("subtitle")}</p>
          </div>
          {role !== "aluno" && (
            <button onClick={() => setShowForm(!showForm)} className="btn-gold text-sm px-5 py-2.5">
              {showForm ? t("cancelar") : t("novaCompeticao")}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={criarCompeticao} className="glass-card p-6 mb-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input name="nome" placeholder={t("placeholderNome")} required className="input-field" />
              <input name="data" type="date" required className="input-field" />
              <input name="local" placeholder={t("placeholderLocal")} className="input-field" />
              <select name="faixa" aria-label={t("faixa")} className="input-field">
                <option value="">{t("todasFaixas")}</option>
                <option value="Branca">Branca</option>
                <option value="Azul">Azul</option>
                <option value="Roxa">Roxa</option>
                <option value="Marrom">Marrom</option>
                <option value="Preta">Preta</option>
              </select>
              <select name="categoria" aria-label={t("categoria")} className="input-field">
                <option value="">{t("todasCategorias")}</option>
                <option value="adulto">Adulto</option>
                <option value="infantil">Infantil</option>
                <option value="master">Master</option>
              </select>
            </div>
            <button type="submit" className="btn-gold text-sm px-6 py-2.5">{t("salvar")}</button>
          </form>
        )}

        {competicoes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text)" }}>{t("nenhumaCompeticao")}</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("descEmpty")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {competicoes.map((comp) => (
              <div key={comp.id} className="glass-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>{comp.nome}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      <span>📅 {new Date(comp.data).toLocaleDateString(intlLocales[locale])}</span>
                      {comp.local && <span>• 📍 {comp.local}</span>}
                      {comp.faixa && <span>• 🥋 {comp.faixa}</span>}
                    </div>
                  </div>
                  {role !== "aluno" && (
                    <button onClick={() => excluirCompeticao(comp.id)} className="text-xs text-[var(--red)] hover:underline">{t("excluir")}</button>
                  )}
                </div>

                {comp.participacoes.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {comp.participacoes.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)]" style={{ background: "var(--bg-surface)" }}>
                        <span>{medalhas[p.posicao as keyof typeof medalhas] || "🥋"}</span>
                        <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>{p.aluno.nome}</span>
                        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{p.aluno.faixa}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{t("nenhumParticipante")}</p>
                )}

                {role !== "aluno" && (
                  <div className="mt-3 pt-3 border-t border-[var(--border)]">
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>{t("adicionarParticipante")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {alunos.filter((a) => !comp.participacoes.find((p) => p.aluno.id === a.id)).slice(0, 8).map((aluno) => (
                        <div key={aluno.id} className="flex gap-1">
                          {posicoes.map((pos) => (
                            <button
                              key={pos.value}
                              onClick={() => adicionarParticipacao(comp.id, aluno.id, pos.value)}
                              className="text-[10px] px-2 py-1 rounded border border-[var(--border)] hover:border-[var(--gold)] transition-colors"
                              title={t("posicaoAria").replace("{nome}", aluno.nome).replace("{posicao}", t(pos.label))}
                            >
                              {medalhas[pos.value]} {aluno.nome.split(" ")[0]}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
